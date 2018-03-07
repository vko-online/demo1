import { _ } from 'lodash'
import faker from 'faker'
import Sequelize from 'sequelize'
import bcrypt from 'bcrypt'

// initialize our database
const db = new Sequelize('bubbles', null, null, {
  dialect: 'sqlite',
  storage: './bubbles.sqlite',
  logging: false // mark this true if you want to see logs
})

// define groups
const MatchModel = db.define('match', {
  status: { type: Sequelize.STRING }
}, {
  name: {
    singular: 'match',
    plural: 'matches'
  }
})

// define decision
const DecisionModel = db.define('decision', {
  status: { type: Sequelize.STRING } // liked, disliked, skipped
})

// define messages
const MessageModel = db.define('message', {
  text: { type: Sequelize.STRING }
})

// define users
const UserModel = db.define('user', {
  badgeCount: { type: Sequelize.INTEGER },
  avatar: { type: Sequelize.STRING },
  email: { type: Sequelize.STRING },
  username: { type: Sequelize.STRING },
  password: { type: Sequelize.STRING },
  registrationId: { type: Sequelize.STRING }, // device registration for push notifications
  version: { type: Sequelize.INTEGER }, // version the password
  gender: { type: Sequelize.STRING },
  location: { type: Sequelize.STRING },
  age: { type: Sequelize.INTEGER },
  status: { type: Sequelize.STRING },
  images: {
    type: Sequelize.STRING,
    get: function () {
      return JSON.parse(this.getDataValue('images') || '[]')
    },
    set: function (val) {
      return this.setDataValue('images', JSON.stringify(val || []))
    }
  }
})

// Match Message User
// messages are sent from users
// messages are sent to matches
// track last read message in a match for a given user
MessageModel.belongsTo(UserModel)
MessageModel.belongsToMany(UserModel, {
  through: 'MessageUser',
  as: 'lastRead'
})
UserModel.belongsToMany(MessageModel, {
  through: 'MessageUser',
  as: 'lastRead'
})
MessageModel.belongsTo(MatchModel)

UserModel.belongsToMany(DecisionModel, { through: 'UserDecision', as: 'who' })
DecisionModel.belongsTo(UserModel, { through: 'UserDecision', as: 'who' })

UserModel.belongsToMany(DecisionModel, { through: 'UserDecision', as: 'whom' })
DecisionModel.belongsTo(UserModel, { through: 'UserDecision', as: 'whom' })

// Match users
MatchModel.belongsToMany(UserModel, { through: 'MatchUser' })
UserModel.belongsToMany(MatchModel, { through: 'MatchUser' })

// create fake starter data
const USERS = 100
const STATUSES = [
  'Friendship',
  'FTW',
  'Open Relationship',
  'DTF'
]

const DECISIONS = ['liked', 'disliked', 'skipped']

faker.seed(123) // get consistent data every time we reload app

if (process.env.REFRESH) {
  db
    .sync({ force: true })
    .then(async () => {
      const promiseUsers = await _.times(USERS, async () => {
        const password = '1'
        const hash = await bcrypt.hash(password, 10)
        const user = await UserModel.create({
          badgeCount: 0,
          email: faker.internet.email(),
          username: faker.internet.userName(),
          password: hash,
          version: 1,
          gender: Math.random() > 0.5 ? 'male' : 'female',
          location: 'Almaty',
          age: Math.floor(Math.random() * 20 + 18),
          status: _.sample(STATUSES)
        })
        console.log(`{${user.email}, ${password}}, ${user.username}}`)
        return user
      })
      Promise.all(promiseUsers).then(users => {
        users.forEach(user => {
          const validOtherUsers = users.filter(v => {
            const g = user.gender === 'male' ? 'female' : 'male'
            return v.gender === g &&
              v.location === user.location &&
              v.status === user.status &&
              v.id !== user.id
          })
          validOtherUsers.forEach(async person => {
            const decision = await DecisionModel.create({
              whoId: user.id,
              whomId: person.id,
              status: _.sample(DECISIONS)
            })
            if (decision.status === 'liked') {
              const oldDecision = await Decision.findOne({
                where: {
                  status: 'liked',
                  whomId: user.id,
                  whoId: person.id
                }
              })
              if (oldDecision) {
                const match = await Match.create({
                  status: 'liked'
                })
                await match.setUsers([user.id, person.id])
              }
            }
            if (decision.status === 'disliked') {
              // create disliked match
              const match = await Match.create({
                status: 'disliked'
              })
              await match.setUsers([user.id, person.id])
            }
          })
        })
      })
    })
}

const Match = db.models.match
const Message = db.models.message
const User = db.models.user
const Decision = db.models.decision

export { Match, Message, User, Decision }
