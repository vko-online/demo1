import React from 'react'
import {
  View
} from 'react-native'
import PropTypes from 'prop-types'
import LinearGradient from 'react-native-linear-gradient'
import { Text } from './text.component'
import { colors } from './theme.component'

const SectionHeader = ({ title, children }) => {
  // inline styles used for brevity, use a stylesheet when possible
  const textStyle = {
    paddingVertical: 10,
    color: colors.lightText
  }

  const viewStyle = {
    height: 32,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 17,
    paddingRight: 10
  }
  return (
    <LinearGradient colors={['#F4F6F7', '#EBEEF1']} style={viewStyle}>
      <Text style={textStyle}>
        {title}
      </Text>
      {children}
    </LinearGradient>
  )
}
SectionHeader.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element)
  ])
}

const SectionItem = ({ empty, title, children }) => {
  const textStyle = {
    paddingVertical: empty ? 30 : 10,
    color: empty ? colors.lightText : colors.darkText,
    fontSize: 16,
    paddingHorizontal: 17,
    textAlign: empty ? 'center' : 'left',
    flexDirection: 'row',
    justifyContent: empty ? 'center' : 'flex-start',
    alignItems: 'center'
  }
  return title ? <Text style={textStyle}>{title}</Text> : <View>{children}</View>
}
SectionItem.propTypes = {
  empty: PropTypes.bool,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element)
  ])
}

SectionItem.defaultProps = {
  empty: false
}

export { SectionHeader, SectionItem }
