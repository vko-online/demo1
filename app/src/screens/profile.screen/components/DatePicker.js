import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, View, StyleSheet } from 'react-native'
import DateTimePicker from 'react-native-modal-datetime-picker'

export default class DatePicker extends Component {
  static propTypes = {
    selectedValue: PropTypes.object,
    onSelect: PropTypes.func,
    children: PropTypes.element
  };

  state = {
    isDateTimePickerVisible: false
  };

  handleOpen = () => this.setState({ isDateTimePickerVisible: true });

  handleClose = () => this.setState({ isDateTimePickerVisible: false });

  handleDatePicked = date => {
    this.props.onSelect(date)
    this.handleClose()
  };

  render () {
    return (
      <View style={styles.root}>
        <DateTimePicker
          date={this.props.selectedValue}
          isVisible={this.state.isDateTimePickerVisible}
          onCancel={this.handleClose}
          onConfirm={this.handleDatePicked}
        />
        <View style={styles.row}>
          {this.props.children}
          <Button title='Change' onPress={this.handleOpen} />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
})
