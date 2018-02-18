import React, { Component } from 'react'
import { Button, View, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import DateTimePicker from 'react-native-modal-datetime-picker'

class DatePicker extends Component {
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
    const initialDate = this.props.selectedValue || new Date()
    return (
      <View style={styles.root}>
        <DateTimePicker
          date={initialDate}
          mode='datetime'
          isVisible={this.state.isDateTimePickerVisible}
          onCancel={this.handleClose}
          onConfirm={this.handleDatePicked}
        />
        <View style={styles.row}>
          {this.props.children}
          <Button title={this.props.text} onPress={this.handleOpen} />
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
    justifyContent: 'flex-end',
    alignItems: 'center'
  }
})

DatePicker.propTypes = {
  selectedValue: PropTypes.object,
  text: PropTypes.string,
  onSelect: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ])
}

export default DatePicker
