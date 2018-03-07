import React, { Component } from 'react'
import { AsyncStorage } from 'react-native'
import { Notifications, AppLoading, Asset, Font } from 'expo'
import { Ionicons } from '@expo/vector-icons'

import { ApolloProvider } from 'react-apollo'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import ApolloClient from 'apollo-client'
import {
  SubscriptionClient,
  addGraphQLSubscriptions
} from 'subscriptions-transport-ws'
import { persistStore, autoRehydrate } from 'redux-persist'
import thunk from 'redux-thunk'
import _ from 'lodash'
// import { WillPresentNotificationResult } from 'react-native-fcm'
import { NavigationActions } from 'react-navigation'
import { createBatchingNetworkInterface } from 'apollo-upload-client'

import AppWithNavigationState, { navigationReducer } from './navigation'
import auth from './reducers/auth.reducer'
import stream from './reducers/stream.reducer'
import { logout } from './actions/auth.actions'
// import { FirebaseClient } from './firebase-client'

const URL = 'localhost:8080' // set your comp's url here

const networkInterface = createBatchingNetworkInterface({
  uri: `http://${URL}/graphql`,
  batchInterval: 10,
  queryDeduplication: true
})

// middleware for requests
networkInterface.use([
  {
    applyBatchMiddleware (req, next) {
      if (!req.options.headers) {
        req.options.headers = {}
      }
      // get the authentication token from local storage if it exists
      const jwt = store.getState().auth.jwt
      if (jwt) {
        req.options.headers.authorization = `Bearer ${jwt}`
      }
      next()
    }
  }
])

// afterware for responses
networkInterface.useAfter([
  {
    applyBatchAfterware ({ responses }, next) {
      let isUnauthorized = false

      responses.forEach(response => {
        if (response.errors) {
          console.log('GraphQL Error:', response.errors)
          if (_.some(response.errors, { message: 'Unauthorized' })) {
            isUnauthorized = true
          }
        }
      })

      if (isUnauthorized) {
        store.dispatch(logout())
      }

      next()
    }
  }
])

// Create WebSocket client
export const wsClient = new SubscriptionClient(`ws://${URL}/subscriptions`, {
  reconnect: true,
  connectionParams () {
    // get the authentication token from local storage if it exists
    return { jwt: store.getState().auth.jwt }
  },
  lazy: true
})

// Extend the network interface with the WebSocket
const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
)

export const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions
})

export const store = createStore(
  combineReducers({
    apollo: client.reducer(),
    nav: navigationReducer,
    auth,
    stream
  }),
  {}, // initial state
  composeWithDevTools(
    applyMiddleware(client.middleware(), thunk),
    autoRehydrate()
  )
)

Notifications.addListener(handleNotification)

function handleNotification (notification) {
  const match = JSON.parse(notification.match)

  // reset navigation and redirect to match's messages screen
  const navigateAction = NavigationActions.reset({
    index: 1,
    actions: [
      NavigationActions.navigate({ routeName: 'Main' }),
      NavigationActions.navigate({
        routeName: 'Messages',
        params: {
          matchId: match.id,
          title: 'New Match',
          icon: ''
        }
      })
    ]
  })
  store.dispatch(navigateAction)
}

// persistent storage
persistStore(store, {
  storage: AsyncStorage,
  blacklist: ['apollo', 'nav', 'filter'] // don't persist apollo or nav for now
})

export default class App extends Component {
  state = {
    isLoadingComplete: false
  }

  handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true })
  }

  loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([require('./assets/images/no.jpg')]),
      Font.loadAsync({
        ...Ionicons.font,
        'avenir-next': require('./assets/fonts/avenir-next-regular.ttf'),
        'avenir-next-bold': require('./assets/fonts/avenir-next-bold.ttf'),
        'markweb-medium': require('./assets/fonts/MarkWeb-Medium.ttf'),
        markweb: require('./assets/fonts/MarkWeb.ttf'),
        brandon: require('./assets/fonts/brandon.ttf')
      })
    ])
  }

  render () {
    if (!this.state.isLoadingComplete) {
      return (
        <AppLoading
          startAsync={this.loadResourcesAsync}
          onError={this.handleLoadingError}
          onFinish={this.handleFinishLoading}
        />
      )
    } else {
      return (
        <ApolloProvider store={store} client={client}>
          <AppWithNavigationState />
        </ApolloProvider>
      )
    }
  }
}
