import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Dimensions, Text as ReactNativeText } from 'react-native'
import { colors } from './theme.component'

export function Text ({ style, ...props }) {
  const centerStyle = props.center ? {textAlign: 'center'} : undefined
  return <ReactNativeText style={[styles.font, style, centerStyle]} {...props} />
}

export function Heading1 ({ style, ...props }) {
  const centerStyle = props.center ? {textAlign: 'center'} : undefined
  return <ReactNativeText style={[styles.font, styles.h1, style, centerStyle]} {...props} />
}

export function Heading2 ({ style, ...props }) {
  const centerStyle = props.center ? {textAlign: 'center'} : undefined
  return <ReactNativeText style={[styles.font, styles.h2, style, centerStyle]} {...props} />
}

export function Paragraph ({ style, ...props }) {
  const centerStyle = props.center ? {textAlign: 'center'} : undefined
  return <ReactNativeText style={[styles.font, styles.p, style, centerStyle]} {...props} />
}

Text.propTypes = {
  style: PropTypes.any,
  center: PropTypes.bool
}

Heading1.propTypes = {
  style: PropTypes.any,
  center: PropTypes.bool
}

Heading2.propTypes = {
  style: PropTypes.any,
  center: PropTypes.bool
}

Paragraph.propTypes = {
  style: PropTypes.any,
  center: PropTypes.bool
}

const scale = Dimensions.get('window').width / 375

function normalize (size) {
  return Math.round(scale * size)
}

const styles = StyleSheet.create({
  font: {
    fontFamily: 'Avenir Next'
  },
  h1: {
    fontSize: normalize(24),
    lineHeight: normalize(27),
    color: colors.darkText,
    fontWeight: 'bold',
    letterSpacing: -1
  },
  h2: {
    fontSize: normalize(18),
    lineHeight: normalize(22),
    color: colors.darkText,
    fontWeight: 'bold',
    letterSpacing: -1
  },
  p: {
    fontSize: normalize(15),
    lineHeight: normalize(23),
    color: colors.lightText
  }
})
