import React, { Component } from 'react'
import { Animated, Dimensions, Easing, View } from 'react-native'
import PropTypes from 'prop-types'

import { Ionicons } from '@expo/vector-icons'

import { colors } from '../../../components/theme.component'

const animationDefault = val => ({
  toValue: val,
  duration: 550,
  easing: Easing.inOut(Easing.quad)
})

export default class Hint extends Component {
  static propTypes = {
    onClose: PropTypes.func
  };

  state = {
    arrowVal: new Animated.Value(0)
  };

  _isMounted = false;

  componentDidMount () {
    this._isMounted = true
    const { arrowVal } = this.state
    const sequence = []
    const count = 5

    for (let i = 0; i <= count; i++) {
      if (i === count) {
        sequence.push(Animated.timing(arrowVal, animationDefault(2)))
      } else if (i % 2) {
        sequence.push(Animated.timing(arrowVal, animationDefault(0)))
      } else {
        sequence.push(Animated.timing(arrowVal, animationDefault(1)))
      }
    }

    Animated.sequence(sequence).start(() => {
      if (this._isMounted) this.props.onClose()
    })
  }
  componentWillUnmount () {
    this._isMounted = false
  }
  render () {
    const { arrowVal } = this.state
    const arrowStyle = {
      backgroundColor: 'transparent',
      opacity: arrowVal.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [0.2, 1, 0]
      }),
      transform: [
        {
          translateY: arrowVal.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [0, -12, 24]
          })
        }
      ]
    }
    const containerStyle = {
      alignItems: 'center',
      backgroundColor: 'transparent',
      bottom: 0,
      left: 0,
      height: 80,
      justifyContent: 'flex-end',
      opacity: 1,
      paddingBottom: 10,
      position: 'absolute',
      width: Dimensions.get('window').width
    }

    return (
      <View pointerEvents='none' style={containerStyle}>
        <Animated.View style={arrowStyle}>
          <Ionicons color={colors.text} name='ios-arrow-up' size={20} />
        </Animated.View>
      </View>
    )
  }
}
