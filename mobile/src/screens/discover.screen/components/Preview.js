import React, { Component } from 'react'
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native'
import PropTypes from 'prop-types'

import { Ionicons } from '@expo/vector-icons'

import { colors, metrics } from '../../../components/theme.component'

const ICON_VARIANT = {
  bottom: 'ios-arrow-up',
  top: 'ios-arrow-down'
}

const animateToValue = val => ({
  toValue: val,
  duration: 150
})

export default class Preview extends Component {
  static propTypes = {
    isActive: PropTypes.bool,
    position: PropTypes.oneOf(['top', 'bottom']),
    subtitle: PropTypes.string,
    title: PropTypes.string
  };

  state = {
    animValue: new Animated.Value(0)
  };

  componentWillReceiveProps (nextProps) {
    if (!this.props.isActive && nextProps.isActive) {
      this.tada()
    }
  }

  tada () {
    const { animValue } = this.state

    Animated.timing(animValue, animateToValue(1)).start(() => {
      Animated.timing(animValue, animateToValue(0)).start()
    })
  }
  render () {
    const { position, subtitle, title } = this.props
    const { animValue } = this.state

    const isAndroid = Platform.OS === 'android'

    const baseStyles = position === 'bottom'
      ? isAndroid ? { bottom: 0 } : { bottom: -metrics.nextupHeight }
      : { top: -metrics.nextupHeight }

    const icon = (
      <Animated.View
        style={{
          backgroundColor: 'transparent',
          transform: [
            {
              scale: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.5]
              })
            }
          ]
        }}
      >
        <Ionicons
          color={colors.text}
          name={ICON_VARIANT[position]}
          size={20}
        />
      </Animated.View>
    )

    const containerStyles = isAndroid
      ? [styles.base, baseStyles]
      : [styles.base, styles.baseIos, baseStyles]

    return (
      <View style={containerStyles}>
        {position === 'bottom' && icon}
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {!!subtitle &&
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>}
        {position === 'top' && icon}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    height: metrics.nextupHeight,
    paddingHorizontal: 60,
    width: Dimensions.get('window').width
  },
  baseIos: {
    position: 'absolute',
    left: 0
  },
  title: {
    textAlign: 'center'
  },
  subtitle: {
    color: colors.gray60,
    textAlign: 'center'
  }
})
