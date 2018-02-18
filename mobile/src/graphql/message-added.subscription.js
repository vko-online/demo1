import gql from 'graphql-tag'

import MESSAGE_FRAGMENT from './message.fragment'

const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription onMessageAdded($matchIds: [Int]){
    messageAdded(matchIds: $matchIds){
      ... MessageFragment
    }
  }
  ${MESSAGE_FRAGMENT}
`

export default MESSAGE_ADDED_SUBSCRIPTION
