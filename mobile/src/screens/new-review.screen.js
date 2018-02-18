import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  Image,
  Button,
  TouchableOpacity
} from 'react-native'
import PropTypes from 'prop-types'
import ReactNativeModal from 'react-native-modal'
import { Text, Heading1 } from '../components/text.component'
import { colors } from '../components/theme.component'
import { Ionicons } from '@expo/vector-icons'

function Star ({ isFull, value, onPress }) {
  const source = isFull
    ? require('../assets/icons/full-star.png')
    : require('../assets/icons/empty-star.png')

  const accessibilityTraits = ['button']
  if (isFull) {
    accessibilityTraits.push('selected')
  }

  return (
    <TouchableOpacity
      accessibilityLabel={`${value} stars`}
      accessibilityTraits={accessibilityTraits}
      style={styles.star}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Image source={source} />
    </TouchableOpacity>
  )
}

Star.propTypes = {
  isFull: PropTypes.bool,
  value: PropTypes.number,
  onPress: PropTypes.func
}

class NewReview extends Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
      state: PropTypes.shape({
        params: PropTypes.shape({
          groupId: PropTypes.number,
          icon: PropTypes.string
        })
      })
    })
  };

  static navigationOptions = ({ navigation }) => {
    const { state } = navigation
    const isReady = state.params && state.params.mode === 'ready'
    return {
      title: 'Rate this event',
      headerLeft: (
        <TouchableOpacity style={{margin: 10, padding: 10}} onPress={() => navigation.goBack()}>
          <Ionicons name='ios-close' size={30} color={colors.darkText} />
        </TouchableOpacity>
      ),
      headerRight: isReady
        ? <Button title='Submit' onPress={state.params.submitReview} />
        : undefined
    }
  };

  state = {
    points: 0,
    text: ''
  };

  componentDidMount () {
    this.refreshNavigation(false)
  }

  componentWillUpdate (nextProps, nextState) {
    if (!!nextState.text.length && !!nextState.points) {
      this.refreshNavigation(true)
    }
  }

  refreshNavigation (fullfilled) {
    const { navigation } = this.props
    navigation.setParams({
      mode: fullfilled ? 'ready' : undefined,
      submitReview: this.submitReview
    })
  }

  submitReview = () => {
    this.props.navigation.goBack()
    // submit to db
  };

  handlePointsChange = pts => this.setState({ points: pts });
  handleTextChange = text => this.setState({ text });

  render () {
    const { points, text } = this.state
    const { navigation: { state } } = this.props

    const stars = [1, 2, 3, 4, 5].map(value => (
      <Star
        key={value}
        value={value}
        isFull={value <= points}
        onPress={this.handlePointsChange}
      />
    ))

    return (
      <View style={styles.container}>
        <View style={styles.body}>
          <Heading1>{state.params.title}</Heading1>
          <Text style={styles.heading}>Rate this event</Text>
          <View style={styles.stars}>
            {stars}
          </View>
        </View>
        <KeyboardAvoidingView style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            onChangeText={this.handleTextChange}
            value={text}
          />
        </KeyboardAvoidingView>
        <Button title='Submit' onPress={() => {}} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  input: {
    width: 500,
    height: 300,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  heading: {},
  inputContainer: {},
  body: {
    marginHorizontal: 50
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 50
  },
  star: {
    flex: 1,
    padding: 5,
    paddingVertical: 15,
    alignItems: 'center'
  }
})

export default NewReview
