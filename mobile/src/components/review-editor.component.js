import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  TextInput,
  Text,
  Button,
  TouchableHighlight,
  View,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native'
import ReactNativeModal from 'react-native-modal'
import { partial } from 'lodash'

import { colors } from './theme.component'
import { Heading2 } from './text.component'

const BORDER_RADIUS = 13
const BACKGROUND_COLOR = 'white'
const BORDER_COLOR = '#d5d5d5'
const TITLE_FONT_SIZE = 13
const TITLE_COLOR = '#8f8f8f'
const BUTTON_FONT_WEIGHT = 'normal'
const BUTTON_FONT_COLOR = '#007ff9'
const BUTTON_FONT_SIZE = 20

const styles = StyleSheet.create({
  contentContainer: {
    justifyContent: 'flex-end',
    margin: 10
  },
  pickerContainer: {
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: BORDER_RADIUS,
    marginBottom: 8,
    overflow: 'hidden'
  },
  titleContainer: {
    borderBottomColor: BORDER_COLOR,
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: 14,
    backgroundColor: 'transparent'
  },
  title: {
    textAlign: 'center',
    color: TITLE_COLOR,
    fontSize: TITLE_FONT_SIZE
  },
  confirmButton: {
    borderColor: BORDER_COLOR,
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'transparent',
    height: 57,
    justifyContent: 'center'
  },
  confirmText: {
    textAlign: 'center',
    color: BUTTON_FONT_COLOR,
    fontSize: BUTTON_FONT_SIZE,
    fontWeight: BUTTON_FONT_WEIGHT,
    backgroundColor: 'transparent'
  },
  cancelButton: {
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: BORDER_RADIUS,
    height: 57,
    justifyContent: 'center'
  },
  cancelText: {
    padding: 10,
    textAlign: 'center',
    color: BUTTON_FONT_COLOR,
    fontSize: BUTTON_FONT_SIZE,
    fontWeight: '600',
    backgroundColor: 'transparent'
  },
  root: {
    flex: 1
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  input: {
    height: 140,
    padding: 20,
    fontFamily: 'markweb-medium',
    fontSize: 18,
    color: colors.darkText
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
  },
  ratingTitle: {
    marginTop: 20
  }
})

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

class ReviewModal extends Component {
  static propTypes = {
    group: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      icon: PropTypes.string
    }),
    onConfirm: PropTypes.func.isRequired,
    onHideAfterConfirm: PropTypes.func,
    onCancel: PropTypes.func.isRequired,
    isVisible: PropTypes.bool
  };

  static defaultProps = {
    cancelText: 'Cancel',
    confirmText: 'Confirm',
    selectedTags: [],
    title: 'Add your review',
    isVisible: false,
    onHideAfterConfirm: () => {}
  };

  state = {
    text: '',
    points: 0
  };

  handleCancel = () => {
    this.confirmed = false
    this.props.onCancel()
  };

  handleConfirm = () => {
    this.confirmed = true
    this.props.onConfirm({
      groupId: this.props.group.id,
      text: this.state.text,
      points: this.state.points
    })
    this.setState({
      text: '',
      points: 0
    })
  };

  handleOnModalHide = () => {
    if (this.confirmed) {
      this.props.onHideAfterConfirm({
        groupId: this.props.group.id,
        text: this.state.text,
        points: this.state.points
      })
    }
  };

  handleTextChange = text => {
    this.setState({
      text
    })
  };

  handlePointsChange = points => {
    this.setState({
      points
    })
  };

  render () {
    const { isVisible } = this.props
    const { points, text } = this.state

    const hasValue = points > 0 && text.length > 0

    const titleContainer = (
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Add review</Text>
      </View>
    )

    const confirmButton = <Text style={styles.confirmText}>Submit</Text>
    const cancelButton = <Text style={styles.cancelText}>Cancel</Text>
    return (
      <ReactNativeModal
        isVisible={isVisible}
        style={styles.contentContainer}
        onModalHide={this.handleOnModalHide}
        backdropOpacity={0.4}
      >
        <View style={styles.pickerContainer}>
          {titleContainer}
          <View>
            <Heading2 style={styles.ratingTitle} center>Overal rating</Heading2>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map(num => {
                return (
                  <Star
                    key={num}
                    value={num}
                    isFull={num <= this.state.points}
                    onPress={partial(this.handlePointsChange, num)}
                  />
                )
              })}
            </View>
            <TextInput
              numberOfLines={4}
              multiline
              placeholder='Your review text'
              style={styles.input}
              onChangeText={this.handleTextChange}
              value={this.state.text}
            />
          </View>
          <TouchableHighlight
            style={styles.confirmButton}
            underlayColor='#ebebeb'
            onPress={this.handleConfirm}
            disabled={!hasValue}
          >
            {confirmButton}
          </TouchableHighlight>
        </View>

        <TouchableHighlight
          style={styles.cancelButton}
          underlayColor='#ebebeb'
          onPress={this.handleCancel}
        >
          {cancelButton}
        </TouchableHighlight>
      </ReactNativeModal>
    )
  }
}

class ReviewEditor extends Component {
  static propTypes = {
    group: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      icon: PropTypes.string
    }),
    onSubmit: PropTypes.func
  };

  state = {
    isModal: false
  };

  handleOpen = () => this.setState({ isModal: true });
  handleClose = () => this.setState({ isModal: false });

  handleChange = ({ groupId, text, points }) => {
    this.props.onSubmit({ groupId, text, points })
    this.handleClose()
  };

  render () {
    return (
      <View style={styles.root}>
        <ReviewModal
          group={this.props.group}
          isVisible={this.state.isModal}
          onCancel={this.handleClose}
          onConfirm={this.handleChange}
        />
        <View style={styles.row}>
          <Button title='Add review' onPress={this.handleOpen} />
        </View>
      </View>
    )
  }
}

export default ReviewEditor
