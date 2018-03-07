import React from 'react'
import { AppRegistry } from 'react-native'
import PropTypes from 'prop-types'
import App from './src/app'

if (!window.navigator.userAgent) {
  window.navigator.userAgent = 'react-native'
}

React.PropTypes = PropTypes

AppRegistry.registerComponent('app', () => App)
