import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Image, View, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo'
import { colors } from './theme.component'
import { Text } from './text.component'

export default class Button extends PureComponent {
  static propTypes = {
    type: PropTypes.oneOf(['primary', 'secondary', 'bordered']),
    icon: PropTypes.string,
    caption: PropTypes.string,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    onPress: PropTypes.func
  };

  static defaultProps = {
    type: 'primary'
  };

  render () {
    const caption = this.props.caption.toUpperCase()
    let icon
    if (this.props.icon) {
      icon = <Image source={this.props.icon} style={styles.icon} />
    }
    let content
    if (this.props.type === 'primary') {
      content = (
        <LinearGradient
          colors={['#6A6AD5', '#6F86D9']}
          end={{ x: 1, y: 1 }}
          start={{ x: 0.5, y: 1 }}
          style={[styles.button, styles.primaryButton]}
        >
          {icon}
          <Text style={[styles.caption, styles.primaryCaption]}>
            {caption}
          </Text>
        </LinearGradient>
      )
    } else {
      var border = this.props.type === 'bordered' && styles.border
      content = (
        <View style={[styles.button, border]}>
          {icon}
          <Text style={[styles.caption, styles.secondaryCaption]}>
            {caption}
          </Text>
        </View>
      )
    }
    return (
      <TouchableOpacity
        accessibilityTraits='button'
        activeOpacity={0.8}
        style={[styles.container, this.props.style]}
        onPress={this.props.onPress}
      >
        {content}
      </TouchableOpacity>
    )
  }
}

const HEIGHT = 30

const styles = StyleSheet.create({
  container: {
    height: HEIGHT
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  border: {
    borderWidth: 1,
    borderColor: colors.lightText,
    borderRadius: 5
  },
  primaryButton: {
    borderRadius: 5,
    backgroundColor: 'transparent'
  },
  icon: {
    marginRight: 12
  },
  caption: {
    letterSpacing: 1,
    fontSize: 12
  },
  primaryCaption: {
    color: 'white'
  },
  secondaryCaption: {
    color: colors.lightText
  }
})
