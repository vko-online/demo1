import express from 'express'
import path from 'path'
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express'
import bodyParser from 'body-parser'
import { createServer } from 'http'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { execute, subscribe } from 'graphql'
import jwt from 'express-jwt'
import jsonwebtoken from 'jsonwebtoken'
import OpticsAgent from 'optics-agent'
import { apolloUploadExpress } from 'apollo-upload-server'

import { JWT_SECRET } from './config'
import { User } from './data/connectors'
import { getSubscriptionDetails } from './subscriptions' // make sure this imports before executableSchema!
import { executableSchema } from './data/schema'
import { subscriptionLogic } from './data/logic'
import { matchLoader, userLoader } from './data/batch'

const GRAPHQL_PORT = 8080
const GRAPHQL_PATH = '/graphql'
const SUBSCRIPTIONS_PATH = '/subscriptions'

Error.stackTraceLimit = Infinity

const app = express()

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// `context` must be an object and can't be undefined when using connectors
app.use(
  '/graphql',
  OpticsAgent.middleware(),
  function (req, res, next) {
    next()
  },
  bodyParser.json(),
  apolloUploadExpress({
    uploadDir: '/tmp/uploads'
  }),
  jwt({
    secret: JWT_SECRET,
    credentialsRequired: false
  }),
  graphqlExpress(req => ({
    schema: OpticsAgent.instrumentSchema(executableSchema),
    context: {
      user: req.user
        ? User.findOne({
          where: { id: req.user.id, version: req.user.version }
        })
        : Promise.resolve(null),
      userLoader: userLoader(), // create a new dataloader for each request
      matchLoader: matchLoader(), // create a new dataloader for each request
      opticsContext: OpticsAgent.context(req) // for Apollo optics
    }
  }))
)

app.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL: GRAPHQL_PATH,
    subscriptionsEndpoint: `ws://localhost:${GRAPHQL_PORT}${SUBSCRIPTIONS_PATH}`
  })
)

const graphQLServer = createServer(app)

graphQLServer.listen(GRAPHQL_PORT, () => {
  console.log(
    `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}${GRAPHQL_PATH}`
  )
  console.log(
    `GraphQL Subscriptions are now running on ws://localhost:${GRAPHQL_PORT}${SUBSCRIPTIONS_PATH}`
  )
})

// eslint-disable-next-line no-unused-vars
const subscriptionServer = SubscriptionServer.create(
  {
    schema: executableSchema,
    execute,
    subscribe,
    onConnect (connectionParams, webSocket) {
      const userPromise = new Promise((resolve, reject) => {
        if (connectionParams.jwt) {
          jsonwebtoken.verify(
            connectionParams.jwt,
            JWT_SECRET,
            (err, decoded) => {
              if (err) {
                reject(new Error('Invalid Token'))
              }

              resolve(
                User.findOne({
                  where: { id: decoded.id, version: decoded.version }
                })
              )
            }
          )
        } else {
          reject(new Error('No Token'))
        }
      })

      return userPromise.then(user => {
        if (user) {
          return { user: Promise.resolve(user) }
        }

        return Promise.reject(new Error('No User'))
      })
    },
    onOperation (parsedMessage, baseParams) {
      // we need to implement this!!!
      const { subscriptionName, args } = getSubscriptionDetails({
        baseParams,
        schema: executableSchema
      })

      // we need to implement this too!!!
      return subscriptionLogic[subscriptionName](
        baseParams,
        args,
        baseParams.context
      )
    }
  },
  {
    server: graphQLServer,
    path: SUBSCRIPTIONS_PATH
  }
)
