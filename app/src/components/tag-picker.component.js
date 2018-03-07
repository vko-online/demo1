import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Text, Button, TouchableHighlight, View, StyleSheet } from 'react-native'
import ReactNativeModal from 'react-native-modal'

import TagList from './tag-list.component'

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
  }
})

class TagPickerComponent extends Component {
  static propTypes = {
    cancelText: PropTypes.string,
    confirmText: PropTypes.string,
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        url: PropTypes.string
      })
    ),
    selectedTags: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        url: PropTypes.string
      })
    ),
    onConfirm: PropTypes.func.isRequired,
    onHideAfterConfirm: PropTypes.func,
    onCancel: PropTypes.func.isRequired,
    title: PropTypes.string,
    isVisible: PropTypes.bool
  };

  static defaultProps = {
    cancelText: 'Cancel',
    confirmText: 'Confirm',
    selectedTags: [],
    title: 'Pick multiple tags',
    isVisible: false,
    onHideAfterConfirm: () => {}
  };

  state = {
    selectedTags: this.props.selectedTags,
    userIsInteractingWithPicker: false
  };

  componentWillReceiveProps (nextProps) {
    if (this.props.selectedTags !== nextProps.selectedTags) {
      this.setState({
        selectedTags: nextProps.selectedTags
      })
    }
  }

  _handleCancel = () => {
    this.confirmed = false
    this.props.onCancel()
  };

  _handleConfirm = () => {
    this.confirmed = true
    this.props.onConfirm(this.state.selectedTags)
  };

  _handleOnModalHide = () => {
    if (this.confirmed) {
      this.props.onHideAfterConfirm(this.state.selectedTags)
    }
  };

  handleTagChange = selectedTags => {
    this.setState({
      selectedTags,
      userIsInteractingWithPicker: false
    })
  };

  _handleUserTouchInit = () => {
    this.setState({
      userIsInteractingWithPicker: true
    })
    return false
  };

  render () {
    const {
      isVisible,
      title,
      confirmText,
      cancelText,
      tags
    } = this.props

    const titleContainer = (
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
    )

    const confirmButton = <Text style={styles.confirmText}>{confirmText}</Text>
    const cancelButton = <Text style={styles.cancelText}>{cancelText}</Text>
    return (
      <ReactNativeModal
        isVisible={isVisible}
        style={styles.contentContainer}
        onModalHide={this._handleOnModalHide}
        backdropOpacity={0.4}
      >
        <View style={styles.pickerContainer}>
          {titleContainer}
          <View onStartShouldSetResponderCapture={this._handleUserTouchInit}>
            <TagList data={tags} selected={this.state.selectedTags} onChange={this.handleTagChange} />
          </View>
          <TouchableHighlight
            style={styles.confirmButton}
            underlayColor='#ebebeb'
            onPress={this._handleConfirm}
            disabled={
              this.state.userIsInteractingWithPicker
            }
          >
            {confirmButton}
          </TouchableHighlight>
        </View>

        <TouchableHighlight
          style={styles.cancelButton}
          underlayColor='#ebebeb'
          onPress={this._handleCancel}
        >
          {cancelButton}
        </TouchableHighlight>
      </ReactNativeModal>
    )
  }
}

class TagPicker extends Component {
  state = {
    isModal: false
  };

  handleOpen = () => this.setState({ isModal: true });
  handleClose = () => this.setState({ isModal: false });

  handleChange = selectedTags => {
    this.props.onSelect(selectedTags)
    this.handleClose()
  };

  render () {
    return (
      <View style={styles.root}>
        <TagPickerComponent
          tags={this.props.tags}
          selectedTags={this.props.selectedValue}
          isVisible={this.state.isModal}
          onCancel={this.handleClose}
          onConfirm={this.handleChange}
        />
        <View style={styles.row}>
          {this.props.children}
          <Button title={this.props.text} onPress={this.handleOpen} />
        </View>
      </View>
    )
  }
}

TagPicker.propTypes = {
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      url: PropTypes.string
    })
  ),
  selectedValue: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      url: PropTypes.string
    })
  ),
  text: PropTypes.string,
  onSelect: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ])
}

export default TagPicker
