import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  View,
  TextInput,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  StatusBar,
  Platform
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flex: 1,
    maxHeight: 40,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginHorizontal: 10
  },
  clearBtn: {
    position: 'absolute',
    top: 8,
    right: 5
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  input__icon: {
    paddingRight: 10
  },
  input: {
    height: 40,
    fontSize: 16,
    width: '100%'
  },
  statusBar: {
    height: STATUSBAR_HEIGHT
  }
})

const CustomStatusBar = ({ backgroundColor, ...props }) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
)

CustomStatusBar.propTypes = {
  backgroundColor: PropTypes.string
}

class HeaderSearch extends Component {
  state = {
    text: '',
    availableWidth: Dimensions.get('window').width
  }
  focusAnim = new Animated.Value(0)

  onFocus = () => {
    Animated.timing(this.focusAnim, {
      toValue: 1,
      duration: 200
    }).start()
  }

  onBlur = () => {
    if (!this.state.text) {
      Animated.timing(this.focusAnim, {
        toValue: 0,
        duration: 200
      }).start()
    }
  }

  forceBlur = () => {
    this.setState({ text: '' }, () => {
      this.refs.textinput.blur()
      Animated.timing(this.focusAnim, {
        toValue: 0,
        duration: 200
      }).start()
    })
  }

  forceFocus = () => {
    this.refs.textinput.focus()
  }

  handleChange = (text) => {
    const { onChange } = this.props

    this.setState({ text })
    onChange(text)
  }

  handleLayout = event => {
    const { width } = event.nativeEvent.layout
    this.setState({ availableWidth: width })
  }

  render () {
    const clearBtnOpacity = this.focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    })

    const textContainerLeft = this.focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [100, this.state.availableWidth]
    })

    const containerLeft = this.focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 60]
    })

    return (
      <TouchableWithoutFeedback onPress={this.forceFocus}>
        <Animated.View style={[styles.container, {paddingLeft: containerLeft}]} onLayout={this.handleLayout}>
          <CustomStatusBar backgroundColor='#fff' />
          <Animated.View style={[styles.inputContainer, {width: textContainerLeft}]}>
            <Ionicons color='#bbb' name='ios-search' size={20} style={styles.input__icon} />
            <TextInput
              ref='textinput'
              placeholder='Search'
              placeholderTextColor='#bbb'
              style={styles.input}
              value={this.state.text}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
              onChangeText={this.handleChange}
            />
          </Animated.View>
          <Animated.View style={[styles.clearBtn, { opacity: clearBtnOpacity }]}>
            <TouchableOpacity onPress={this.forceBlur}>
              <Ionicons color='#bbb' name='md-close-circle' size={20} style={styles.input__icon} />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>
    )
  }
}

HeaderSearch.propTypes = {
  onChange: PropTypes.func
}

export default HeaderSearch
