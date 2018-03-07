import { uniq, map, filter } from 'lodash'
import uuidv4 from 'uuid/v4'
import mime from 'mime-types'

import { Match, Message, User, Decision } from './connectors'
import { sendNotification } from '../notifications'
import { uploadFile, deleteFile, getFileUrl } from '../localFiles'

// reusable function to check for a user with context
async function getAuthenticatedUser (ctx) {
  const user = await ctx.user
  if (!user) return Promise.reject('Unauthorized')
  return user
}

export const messageLogic = {
  from (message, args, ctx) {
    if (!ctx.userLoader) {
      return message.getUser({ attributes: ['id', 'username'] })
    }
    return ctx.userLoader
      .load(message.userId)
      .then(({ id, username }) => ({ id, username }))
  },
  to (message, args, ctx) {
    if (!ctx.matchLoader) {
      return message.getMatch({ attributes: ['id'] })
    }
    return ctx.matchLoader.load(message.matchId).then(({ id }) => ({ id }))
  },
  async createMessage (_, createMessageInput, ctx) {
    const { text, matchId } = createMessageInput.message

    const user = await getAuthenticatedUser(ctx)
    const matches = await user.getMatches({ where: { id: matchId } })
    if (matches.length) {
      const message = await Message.create({
        userId: user.id,
        text,
        matchId
      })
      const match = matches[0]
      const users = await match.getUsers()
      const userPromises = map(filter(users, usr => usr.id !== user.id), usr =>
        usr.increment('badgeCount')
      )
      const updatedUsers = await Promise.all(userPromises)
      const registeredUsers = filter(updatedUsers, usr => usr.registrationId)
      if (registeredUsers.length) {
        registeredUsers.forEach(({ badgeCount, registrationId }) =>
          sendNotification({
            to: registrationId,
            notification: {
              title: `${user.username} @ ${match.name}`,
              body: text,
              sound: 'default', // can use custom sounds -- see https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/SupportingNotificationsinYourApp.html#//apple_ref/doc/uid/TP40008194-CH4-SW10
              badge: badgeCount + 1, // badgeCount doesn't get updated in Promise return?!
              click_action: 'openMatch'
            },
            data: {
              title: `${user.username} @ ${match.id}`, // TODO: need text
              body: text,
              type: 'MESSAGE_ADDED',
              match: {
                id: match.id
              }
            },
            priority: 'high' // will wake sleeping device
          })
        )
      }
      return message
    }
    return Promise.reject('Unauthorized')
  }
}

export const decisionLogic = {
  async createDecision (_, createDecisionInput, ctx) {
    const { personId, status } = createDecisionInput.decision
    const user = await getAuthenticatedUser(ctx)
    const existingDecision = await Decision.findOne({
      where: {
        whoId: user.id,
        whomId: personId
      }
    })
    if (!existingDecision || existingDecision.status === 'skipped') {
      const decision = await Decision.create({
        whoId: user.id,
        whomId: personId,
        status
      })
      if (status === 'liked') {
        const oldDecision = await Decision.findOne({
          where: {
            whomId: user.id,
            whoId: personId,
            status: 'liked'
          }
        })
        if (oldDecision) {
          // create match
          const match = await Match.create({
            status: 'liked'
          })
          await match.setUsers([user.id, personId])
        }
      }
      if (status === 'disliked') {
        const match = await Match.create({
          status: 'disliked'
        })
        await match.setUsers([user.id, personId])
      }
      return decision
    }
    return existingDecision
  }
}

export const matchLogic = {
  users (match) {
    return match.getUsers()
  },
  async messages (match, { messageConnection = {} }) {
    const { first, last, before, after } = messageConnection

    // base query -- get messages from the right match
    const where = { matchId: match.id }

    // because we return messages from newest -> oldest
    // before actually means newer (date > cursor)
    // after actually means older (date < cursor)

    if (before) {
      // convert base-64 to utf8 iso date and use in Date constructor
      where.id = { $gt: Buffer.from(before, 'base64').toString() }
    }

    if (after) {
      where.id = { $lt: Buffer.from(after, 'base64').toString() }
    }

    const messages = await Message.findAll({
      where,
      order: [['id', 'DESC']],
      limit: first || last
    })
    const edges = messages.map(message => ({
      cursor: Buffer.from(message.id.toString()).toString('base64'), // convert createdAt to cursor
      node: message // the node is the message itself
    }))
    return {
      edges,
      pageInfo: {
        async hasNextPage () {
          if (messages.length < (last || first)) {
            return Promise.resolve(false)
          }
          const msgs = await Message.findOne({
            where: {
              matchId: match.id,
              id: {
                [before ? '$gt' : '$lt']: messages[messages.length - 1].id
              }
            },
            order: [['id', 'DESC']]
          })
          return !!msgs
        },
        async hasPreviousPage () {
          const msgs = await Message.findOne({
            where: {
              matchId: match.id,
              id: where.id
            },
            order: [['id']]
          })
          return !!msgs
        }
      }
    }
  },
  async lastRead (match, args, ctx) {
    const user = await getAuthenticatedUser(ctx)
    const lastRead = await user.getLastRead({ where: { matchId: match.id } })
    if (lastRead.length) {
      return lastRead[0]
    }
    return null
  },
  async unreadCount (match, args, ctx) {
    const user = await getAuthenticatedUser(ctx)
    const lastRead = await user.getLastRead({ where: { matchId: match.id } })
    if (!lastRead.length) {
      return Message.count({ where: { matchId: match.id } })
    }
    return Message.count({
      where: {
        matchId: match.id,
        createdAt: { $gt: lastRead[0].createdAt }
      }
    })
  },
  async match (_, { id }, ctx) {
    await getAuthenticatedUser(ctx)
    return Match.findOne({
      where: { id },
      include: [User]
    })
  },
  async all (_, args, ctx) {
    const user = await getAuthenticatedUser(ctx)
    Match.findAll({
      include: [
        {
          model: User,
          where: { id: user.id }
        }
      ]
    })
  }
}

export const userLogic = {
  avatar (user, args, ctx) {
    return user.avatar ? getFileUrl(user.avatar) : null
  },
  images (user, args, ctx) {
    return user.images
  },
  imagesPublic (user, args, ctx) {
    return user.images.map(getFileUrl)
  },
  email (user, args, ctx) {
    return user.email
  },
  location (user, args, ctx) {
    return user.location
  },
  age (user, args, ctx) {
    return user.age
  },
  status (user, args, ctx) {
    return user.status
  },
  async matches (user, args, ctx) {
    const currentUser = await getAuthenticatedUser(ctx)
    if (currentUser.id !== user.id) {
      return Promise.reject('Unauthorized')
    }
    return user.getMatches({ include: [{ model: User }] })
  },
  jwt (user) {
    return Promise.resolve(user.jwt)
  },
  async messages (user, args, ctx) {
    const currentUser = await getAuthenticatedUser(ctx)
    if (currentUser.id !== user.id) {
      return Promise.reject('Unauthorized')
    }
    return Message.findAll({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']]
    })
  },
  async registrationId (user, args, ctx) {
    const currentUser = await getAuthenticatedUser(ctx)
    if (currentUser.id === user.id) {
      return currentUser.registrationId
    }

    return Promise.reject('Unauthorized')
  },
  async query (_, args, ctx) {
    const user = await getAuthenticatedUser(ctx)
    if (user.id === args.id || user.email === args.email) {
      return user
    }

    return Promise.reject('Unauthorized')
  },
  async all (_, args, ctx) {
    const user = await getAuthenticatedUser(ctx)

    const whoDecisions = await Decision.findAll({
      where: {
        whoId: user.id,
        $or: [{status: 'liked'}, {status: 'disliked'}]
      }
    })
    const allDecidedUsers = whoDecisions.map(v => v.whomId)
    const ids = uniq(allDecidedUsers)

    return User.findAll({
      where: {
        gender: user.gender === 'male' ? 'female' : 'male',
        location: user.location,
        status: user.status,
        id: {
          $notIn: ids
        }
      }
    })
  },
  async removeImage (_, removeUserImageInput, ctx) {
    const { image } = removeUserImageInput.user
    const user = await getAuthenticatedUser(ctx)
    const userImages = user.images.filter(v => v !== image)

    await deleteFile(image)
    return user.update({ images: userImages })
  },
  async updateUser (_, updateUserInput, ctx) {
    const {
      registrationId,
      badgeCount,
      avatar,
      avatarSource,
      image,
      username,
      gender,
      location,
      status
    } = updateUserInput.user
    const user = await getAuthenticatedUser(ctx)
    // eslint-disable-line arrow-body-style
    const options = {}

    if (registrationId || registrationId === null) {
      options.registrationId = registrationId
    }

    if (badgeCount || badgeCount === 0) {
      options.badgeCount = badgeCount
    }

    if (username) {
      options.username = username
    }

    if (gender) {
      options.gender = gender
    }

    if (location) {
      options.location = location
    }

    if (status) {
      options.status = status
    }

    if (avatarSource) {
      user.update(Object.assign(options, { avatar: avatarSource }))
    }

    if (avatar) {
      const userImage = user.images
      return uploadFile({
        file: avatar.path,
        options: {
          type: avatar.type,
          size: avatar.size,
          name: `${uuidv4()}.${mime.extension(avatar.type)}`
        }
      })
        .then(data => {
          if (user.avatar) {
            return deleteFile(user.avatar).then(() => data)
          }

          return data
        })
        .then(data =>
          user.update(Object.assign(options, { avatar: data.name, images: [data.name, ...userImage] }))
        )
    }

    if (image) {
      const userImage = user.images
      return uploadFile({
        file: image.path,
        options: {
          type: image.type,
          size: image.size,
          name: `${uuidv4()}.${mime.extension(image.type)}`
        }
      }).then(data =>
        user.update(
          Object.assign(options, { images: [...userImage, data.name] })
        )
      )
    }

    return user.update(options)
  }
}

export const subscriptionLogic = {
  async matchAdded (baseParams, args, ctx) {
    const user = await getAuthenticatedUser(ctx)
    if (user.id !== args.userId) {
      return Promise.reject('Unauthorized')
    }

    baseParams.context = ctx
    return baseParams
  },
  async messageAdded (baseParams, args, ctx) {
    const user = await getAuthenticatedUser(ctx)
    const matches = await user.getMatches({
      where: { id: { $in: args.matchIds } },
      attributes: ['id']
    })
    // user attempted to subscribe to some matches without access
    if (args.matchIds.length > matches.length) {
      return Promise.reject('Unauthorized')
    }

    baseParams.context = ctx
    return baseParams
  }
}
