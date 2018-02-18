import React from 'react'
import PropTypes from 'prop-types'
import { ScrollView, View } from 'react-native'

function Scene ({ scroll, style, ...props }) {
  const styles = [{ flex: 1 }, style]
  const Tag = scroll ? ScrollView : View

  return <Tag style={styles} {...props} />
}

Scene.propTypes = {
  scroll: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.number])
}

export default Scene
