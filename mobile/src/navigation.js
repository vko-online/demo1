import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  AppState
} from 'react-native'
import {
  addNavigationHelpers,
  StackNavigator,
  NavigationActions
} from 'react-navigation'
import { connect } from 'react-redux'
import { graphql, compose } from 'react-apollo'
import update from 'immutability-helper'
import { map } from 'lodash'
import { Buffer } from 'buffer'
import { REHYDRATE } from 'redux-persist/constants'
import { Notifications } from 'expo'

import Signin from './screens/signin.screen'

import Messages from './screens/messages.screen'
import Tab from './screens/tab.screen'

import { USER_QUERY } from './graphql/user.query'
import MESSAGE_ADDED_SUBSCRIPTION from './graphql/message-added.subscription'
import MATCH_ADDED_SUBSCRIPTION from './graphql/match-added.subscription'
import { UPDATE_USER_MUTATION } from './graphql/update-user.mutation'

import { wsClient } from './app'
import { registerForPushNotificationsAsync } from './notification'

const AppNavigator = StackNavigator(
  {
    Tab: { screen: Tab },
    Signin: { screen: Signin },
    Messages: { screen: Messages }
  },
  {
    headerMode: 'none',
    mode: 'modal',
    initialRouteName: 'Tab',
    cardStyle: {
      backgroundColor: '#fff'
    }
  }
)

// reducer initialization code
const firstAction = AppNavigator.router.getActionForPathAndParams('Tab')
const tempNavState = AppNavigator.router.getStateForAction(firstAction)
const initialNavState = AppNavigator.router.getStateForAction(tempNavState)

// reducer code
export const navigationReducer = (state = initialNavState, action) => {
  let nextState
  switch (action.type) {
    case REHYDRATE:
      // convert persisted data to Immutable and confirm rehydration
      if (!action.payload.auth || !action.payload.auth.jwt) {
        const { routes, index } = state
        if (routes[index].routeName !== 'Signin') {
          nextState = AppNavigator.router.getStateForAction(
            NavigationActions.navigate({ routeName: 'Signin' }),
            state
          )
        }
      }
      break
    case 'LOGOUT':
      const { routes, index } = state
      if (routes[index].routeName !== 'Signin') {
        nextState = AppNavigator.router.getStateForAction(
          NavigationActions.navigate({ routeName: 'Signin' }),
          state
        )
      }
      break
    default:
      nextState = AppNavigator.router.getStateForAction(action, state)
      break
  }

  // Simply return the original `state` if `nextState` is null or undefined.
  return nextState || state
}

class AppWithNavigationState extends Component {
  state = {
    appState: AppState.currentState
  };

  componentWillMount () {
    AppState.addEventListener('change', this.handleAppStateChange)
    this.notificationSubscription = Notifications.addListener(
      this.handleNotification
    )
  }

  handleNotification = notification => {
    this.setState({ notification: notification })
  };

  async componentWillReceiveProps (nextProps) {
    // when we get the user, start listening for notifications
    if (nextProps.user && !this.props.user) {
      const registrationId = await registerForPushNotificationsAsync(
        nextProps.user.email
      )
      if (registrationId !== nextProps.user.registrationId) {
        // update notification registration token on server
        nextProps.updateUser({ registrationId })
      }
    }

    if (!nextProps.user) {
      // // unsubscribe from all notifications
      // if (firebaseClient.token) {
      //   firebaseClient.clear()
      // }

      if (this.matchSubscription) {
        this.matchSubscription()
      }

      if (this.messagesSubscription) {
        this.messagesSubscription()
      }

      // clear the event subscription
      if (this.reconnected) {
        this.reconnected()
      }
    } else if (!this.reconnected) {
      this.reconnected = wsClient.onReconnected(() => {
        this.props.refetch() // check for any data lost during disconnect
      }, this)
    }

    if (
      nextProps.user &&
      (!this.props.user ||
        nextProps.user.matches.length !== this.props.user.matches.length)
    ) {
      // unsubscribe from old

      if (typeof this.messagesSubscription === 'function') {
        this.messagesSubscription()
      }
      // subscribe to new
      if (nextProps.user.matches.length) {
        this.messagesSubscription = nextProps.subscribeToMessages()
      }
    }

    if (!this.matchSubscription && nextProps.user) {
      this.matchSubscription = nextProps.subscribeToMatches()
    }
  }

  componentWillUnmount () {
    AppState.removeEventListener('change', this.handleAppStateChange)

    if (this.notificationSubscription) {
      this.notificationSubscription()
    }
  }

  handleAppStateChange = async nextAppState => {
    console.log(
      'App has changed state!',
      nextAppState,
      this.props.user.badgeCount
    )
    if (this.props.user) {
      const badgeNumber = await Notifications.getBadgeNumberAsync()
      if (badgeNumber > 0) {
        Notifications.dismissAllNotificationsAsync()
        Notifications.setBadgeNumberAsync(0)
        this.props.updateUser({ badgeCount: 0 })
      }
    }
    this.setState({ appState: nextAppState })

    // if (this.props.user && FCM.getBadgeNumber()) {
    //   // clear notifications from center/tray
    //   FCM.removeAllDeliveredNotifications()

    //   FCM.setBadgeNumber(0)

    //   // update badge count on server
    //   this.props.updateUser({ badgeCount: 0 })
    // }
  };

  render () {
    const { dispatch, nav } = this.props
    return (
      <AppNavigator navigation={addNavigationHelpers({ dispatch, state: nav })} />
    )
  }
}

AppWithNavigationState.propTypes = {
  dispatch: PropTypes.func.isRequired,
  nav: PropTypes.object.isRequired,
  refetch: PropTypes.func,
  subscribeToMatches: PropTypes.func,
  subscribeToMessages: PropTypes.func,
  updateUser: PropTypes.func,
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    badgeCount: PropTypes.number,
    email: PropTypes.string.isRequired,
    registrationId: PropTypes.string,
    matches: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired
      })
    )
  })
}

const mapStateToProps = ({ auth, nav }) => ({
  auth,
  nav
})

const userQuery = graphql(USER_QUERY, {
  skip: ownProps => !ownProps.auth || !ownProps.auth.jwt,
  options: ownProps => ({ variables: { id: ownProps.auth.id } }),
  props: ({
    data: { loading, user, refetch, subscribeToMore },
    ownProps: { nav }
  }) => ({
    loading,
    user,
    refetch,
    subscribeToMessages () {
      return subscribeToMore({
        document: MESSAGE_ADDED_SUBSCRIPTION,
        variables: {
          matchIds: map(user.matches, 'id')
        },
        updateQuery: (previousResult, { subscriptionData }) => {
          const previousMatches = previousResult.user.matches
          const newMessage = subscriptionData.data.messageAdded

          const matchIndex = map(previousMatches, 'id').indexOf(
            newMessage.to.id
          )

          const { index, routes } = nav
          let unreadCount = previousMatches[matchIndex].unreadCount
          if (
            routes[index].routeName !== 'Messages' ||
            routes[index].params.matchId !== matchIndex
          ) {
            unreadCount += 1
          }

          return update(previousResult, {
            user: {
              matches: {
                [matchIndex]: {
                  messages: {
                    edges: {
                      $set: [
                        {
                          __typename: 'MessageEdge',
                          node: newMessage,
                          cursor: Buffer.from(
                            newMessage.id.toString()
                          ).toString('base64')
                        }
                      ]
                    }
                  },
                  unreadCount: { $set: unreadCount }
                }
              }
            }
          })
        }
      })
    },
    subscribeToMatches () {
      return subscribeToMore({
        document: MATCH_ADDED_SUBSCRIPTION,
        variables: { userId: user.id },
        updateQuery: (previousResult, { subscriptionData }) => {
          const newMatch = subscriptionData.data.matchAdded

          return update(previousResult, {
            user: {
              matches: { $push: [newMatch] }
            }
          })
        }
      })
    }
  })
})

const updateUserMutation = graphql(UPDATE_USER_MUTATION, {
  props: ({ mutate }) => ({
    updateUser: user =>
      mutate({
        variables: { user }
      })
  })
})

export default compose(connect(mapStateToProps), updateUserMutation, userQuery)(
  AppWithNavigationState
)
