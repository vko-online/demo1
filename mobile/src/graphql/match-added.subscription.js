import gql from 'graphql-tag'

import MATCH_FRAGMENT from './match.fragment'

const MATCH_ADDED_SUBSCRIPTION = gql`
  subscription onMatchAdded($userId: Int, $messageConnection: ConnectionInput){
    matchAdded(userId: $userId){
      ... MatchFragment
    }
  }
  ${MATCH_FRAGMENT}
`

export default MATCH_ADDED_SUBSCRIPTION
