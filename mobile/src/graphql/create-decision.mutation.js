import gql from 'graphql-tag'

const CREATE_DECISION_MUTATION = gql`
  mutation createDecision($decision: CreateDecisionInput!) {
    createDecision(decision: $decision) {
      status
    }
  }
`

export default CREATE_DECISION_MUTATION
