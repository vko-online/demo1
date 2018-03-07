import React from 'react'
import PropTypes from 'prop-types'
import App from './src/app'

if (!window.navigator.userAgent) {
  window.navigator.userAgent = 'react-native'
}

React.PropTypes = PropTypes

export default App
