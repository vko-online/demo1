import gql from 'graphql-tag'

export const UPDATE_USER_MUTATION = gql`
  mutation updateUser($user: UpdateUserInput!) {
    updateUser(user: $user) {
      id
      avatar
      badgeCount
      registrationId
      username
      images
      imagesPublic
      location
      gender
      status
      age
    }
  }
`
export const REMOVE_USER_IMAGE_MUTATION = gql`
  mutation removeUserImage($user: RemoveUserImageInput!) {
    removeUserImage(user: $user) {
      id
      avatar
      images
      imagesPublic
      badgeCount
      registrationId
      username
      location
      gender
      status
      age
    }
  }
`
