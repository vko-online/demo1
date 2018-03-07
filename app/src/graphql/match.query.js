import gql from 'graphql-tag'

import MATCH_FRAGMENT from './match.fragment'

export const MATCH_QUERY = gql`
  query match($matchId: Int!, $messageConnection: ConnectionInput = {first: 0}) {
    match(id: $matchId) {
      ... MatchFragment
    }
  }
  ${MATCH_FRAGMENT}
`

export const MATCH_ALL = gql`
  query matches($messageConnection: ConnectionInput = {first: 0}) {
    matches {
      ... MatchFragment
    }
  }
  ${MATCH_FRAGMENT}
`
