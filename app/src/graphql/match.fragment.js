import gql from 'graphql-tag'

import MESSAGE_FRAGMENT from './message.fragment'

const MATCH_FRAGMENT = gql`
  fragment MatchFragment on Match {
    id
    unreadCount
    createdAt
    lastRead {
      id
      createdAt
    }
    users {
      id
      avatar
      username
      gender
      location
      status
      age
    }
    messages(messageConnection: $messageConnection) {
      edges {
        cursor
        node {
          ... MessageFragment
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
  ${MESSAGE_FRAGMENT}
`

export default MATCH_FRAGMENT
