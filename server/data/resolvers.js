import GraphQLDate from 'graphql-date'
import { withFilter } from 'graphql-subscriptions'
import { map } from 'lodash'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { User } from './connectors'
import { pubsub } from '../subscriptions'
import { JWT_SECRET } from '../config'
import { decisionLogic, matchLogic, messageLogic, userLogic } from './logic'

const MESSAGE_ADDED_TOPIC = 'messageAdded'
const MATCH_ADDED_TOPIC = 'matchAdded'

export const Resolvers = {
  Date: GraphQLDate,
  PageInfo: {
    // we will have each connection supply its own hasNextPage/hasPreviousPage functions!
    hasNextPage (connection, args) {
      return connection.hasNextPage()
    },
    hasPreviousPage (connection, args) {
      return connection.hasPreviousPage()
    }
  },
  Query: {
    match (_, args, ctx) {
      return matchLogic.match(_, args, ctx)
    },
    matches (_, args, ctx) {
      return matchLogic.all(_, args, ctx)
    },
    user (_, args, ctx) {
      return userLogic.query(_, args, ctx)
    },
    users (_, args, ctx) {
      return userLogic.all(_, args, ctx)
    }
  },
  Mutation: {
    async createMessage (_, args, ctx) {
      const message = await messageLogic.createMessage(_, args, ctx)
      // Publish subscription notification with message
      pubsub.publish(MESSAGE_ADDED_TOPIC, { [MESSAGE_ADDED_TOPIC]: message })
      return message
    },
    async createDecision (_, args, ctx) {
      const decision = await decisionLogic.createDecision(_, args, ctx)
      pubsub.publish(MATCH_ADDED_TOPIC, { [MATCH_ADDED_TOPIC]: decision })
      return decision
    },
    updateUser (_, args, ctx) {
      return userLogic.updateUser(_, args, ctx)
    },
    removeUserImage (_, args, ctx) {
      return userLogic.removeImage(_, args, ctx)
    },
    async login (_, signinUserInput, ctx) {
      // find user by email
      const { email, password } = signinUserInput.user
      const user = await User.findOne({ where: { email } })
      if (user) {
        // validate password
        const res = await bcrypt.compare(password, user.password)
        if (res) {
          // create jwt
          const token = jwt.sign(
            {
              id: user.id,
              email: user.email,
              version: user.version
            },
            JWT_SECRET
          )
          user.jwt = token
          ctx.user = Promise.resolve(user)
          return user
        }
        return Promise.reject(new Error('Password incorrect'))
      }
      return Promise.reject(new Error('Email not found'))
    },
    async signup (_, signinUserInput, ctx) {
      const { email, password, username } = signinUserInput.user
      // find user by email
      const existing = await User.findOne({ where: { email } })
      if (!existing) {
        // hash password and create user
        const hash = await bcrypt.hash(password, 10)
        const user = await User.create({
          email,
          password: hash,
          username: username || email,
          version: 1
        })
        const { id } = user
        const token = jwt.sign({ id, email, version: 1 }, JWT_SECRET)
        user.jwt = token
        ctx.user = Promise.resolve(user)
        return user
      }

      return Promise.reject(new Error('Email already exists')) // email already exists
    }
  },
  Subscription: {
    messageAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(MESSAGE_ADDED_TOPIC),
        (payload, args, ctx) => {
          return ctx.user.then(user => {
            return Boolean(
              args.matchIds &&
                ~args.matchIds.indexOf(payload.messageAdded.matchId) &&
                user.id !== payload.messageAdded.userId // don't send to user creating message
            )
          })
        }
      )
    },
    matchAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(MATCH_ADDED_TOPIC),
        (payload, args, ctx) => {
          return ctx.user.then(user => {
            return Boolean(
              args.userId &&
                ~map(payload.matchAdded.users, 'id').indexOf(args.userId) &&
                user.id !== payload.matchAdded.users[0].id // don't send to user creating match
            )
          })
        }
      )
    }
  },
  Match: {
    users (match, args, ctx) {
      return matchLogic.users(match, args, ctx)
    },
    messages (match, args, ctx) {
      return matchLogic.messages(match, args, ctx)
    },
    lastRead (match, args, ctx) {
      return matchLogic.lastRead(match, args, ctx)
    },
    unreadCount (match, args, ctx) {
      return matchLogic.unreadCount(match, args, ctx)
    }
  },
  Message: {
    to (message, args, ctx) {
      return messageLogic.to(message, args, ctx)
    },
    from (message, args, ctx) {
      return messageLogic.from(message, args, ctx)
    }
  },
  User: {
    avatar (user, args, ctx) {
      return userLogic.avatar(user, args, ctx)
    },
    images (user, args, ctx) {
      return userLogic.images(user, args, ctx)
    },
    imagesPublic (user, args, ctx) {
      return userLogic.imagesPublic(user, args, ctx)
    },
    email (user, args, ctx) {
      return userLogic.email(user, args, ctx)
    },
    location (user, args, ctx) {
      return userLogic.location(user, args, ctx)
    },
    age (user, args, ctx) {
      return userLogic.age(user, args, ctx)
    },
    status (user, args, ctx) {
      return userLogic.status(user, args, ctx)
    },
    matches (user, args, ctx) {
      return userLogic.matches(user, args, ctx)
    },
    jwt (user, args, ctx) {
      return userLogic.jwt(user, args, ctx)
    },
    messages (user, args, ctx) {
      return userLogic.messages(user, args, ctx)
    },
    registrationId (user, args, ctx) {
      return userLogic.registrationId(user, args, ctx)
    }
  }
}

export default Resolvers
