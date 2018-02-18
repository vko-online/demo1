import gql from 'graphql-tag'

import MESSAGE_FRAGMENT from './message.fragment'

// get the user and all user's groups
export const USER_QUERY = gql`
  query user($id: Int) {
    user(id: $id) {
      id
      avatar
      images
      imagesPublic
      badgeCount
      email
      registrationId
      username
      location
      gender
      age
      status
      matches {
        id
        unreadCount
        createdAt
        users {
          id
          avatar
          images
          imagesPublic
          username
          location
          gender
          status
          age
        }
        messages(messageConnection: { first: 1 }) { # we don't need to use variables
          edges {
            cursor
            node {
              ... MessageFragment
            }
          }
        }
      }
    }
  }
  ${MESSAGE_FRAGMENT}
`

export const USER_ALL_QUERY = gql`
query users {
  users {
    id
    avatar
    images
    imagesPublic
    email
    username
    location
    gender
    age
    status
  }
}
`
