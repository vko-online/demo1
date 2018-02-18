import { makeExecutableSchema } from 'graphql-tools'

import { Resolvers } from './resolvers'

export const Schema = [
  `
  # declare custom scalars
  scalar Date

  # input for file types
  input File {
    name: String!
    type: String!
    size: Int!
    path: String!
  }

  # input for creating messages
  input CreateMessageInput {
    matchId: Int!
    text: String!
  }

  input CreateDecisionInput {
    personId: Int!
    status: String!
  }

  # input for signing in users
  input SigninUserInput {
    email: String!
    password: String!
    username: String
  }

  # input for removing user image
  input RemoveUserImageInput {
    image: String! # image id
  }

  # input for updating users
  input UpdateUserInput {
    avatar: File
    image: File
    avatarSource: String # set avatar by url not file
    badgeCount: Int
    username: String
    registrationId: String
    gender: String
    location: String
    status: String
    age: Int
  }

  # input for relay cursor connections
  input ConnectionInput {
    first: Int
    after: String
    last: Int
    before: String
  }

  type MessageConnection {
    edges: [MessageEdge]
    pageInfo: PageInfo!
  }

  type MessageEdge {
    cursor: String!
    node: Message!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type Decision {
    who: User!
    whom: User!
    status: String
  }

  # a match chat entity
  type Match {
    id: Int! # unique id for the match
    createdAt: Date! # created at date
    users: [User]! # users in the match
    messages(messageConnection: ConnectionInput): MessageConnection # messages sent to the match
    lastRead: Message # message last read by user
    unreadCount: Int # number of unread messages by user
  }

  # a user -- keep type really simple for now
  type User {
    id: Int! # unique id for the user
    badgeCount: Int # number of unread notifications
    email: String! # we will also require a unique email per user
    username: String # this is the name we'll show other users
    messages: [Message] # messages sent by user
    matches: [Match]! # matches the user belongs to
    jwt: String # json web token for access
    registrationId: String
    avatar: String # url for avatar image
    images: [String] # url of images
    imagesPublic: [String] # url of images with server url
    location: String
    gender: String
    status: String
    age: Int
  }

  # a message sent from a user to a match
  type Message {
    id: Int! # unique id for message
    to: Match! # match message was sent in
    from: User! # user who sent the message
    text: String! # message text
    createdAt: Date! # when message was created
  }

  # query for types
  type Query {
    # Return a user by their email or id
    user(email: String, id: Int): User

    # Return users by profile
    users: [User]

    # Return messages sent by a user via userId
    # Return messages sent to a match via matchId
    messages(matchId: Int, userId: Int): [Message]

    # Return a match by its id
    match(id: Int!): Match

    # Return multiple matches
    matches: [Match]
  }

  type Mutation {
    # send a message to a match
    createMessage(message: CreateMessageInput!): Message
    createDecision(decision: CreateDecisionInput!): Decision
    updateUser(user: UpdateUserInput!): User # update registration for user
    removeUserImage(user: RemoveUserImageInput!): User # update registration for user
    login(user: SigninUserInput!): User
    signup(user: SigninUserInput!): User
  }

  type Subscription {
    # Subscription fires on every message added
    # for any of the matches with one of these matchIds
    messageAdded(matchIds: [Int]): Message
    matchAdded(userId: Int): Match
  }
  
  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`
]

export const executableSchema = makeExecutableSchema({
  typeDefs: Schema,
  resolvers: Resolvers
})

export default executableSchema
