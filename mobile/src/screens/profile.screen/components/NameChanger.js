import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  Button,
  Dimensions
} from 'react-native'
import { colors } from '../../../components/theme.component'

export default class NameChanger extends Component {
  static propTypes = {
    selectedValue: PropTypes.string,
    onSubmit: PropTypes.func
  };

  state = {
    isEditing: false,
    text: this.props.selectedValue
  };

  handleEditing = () => this.setState({ isEditing: true });
  handleFinish = () =>
    this.setState({ isEditing: false }, this.props.onSubmit(this.state.text));

  handleChangeText = text => this.setState({ text });

  render () {
    const { isEditing } = this.state

    if (isEditing) {
      return (
        <View style={styles.root}>
          <View style={styles.row}>
            <TextInput
              numberOfLines={1}
              style={styles.input}
              value={this.state.text}
              defaultValue={this.props.selectedValue}
              onChangeText={this.handleChangeText}
            />
            <Button title='Apply' onPress={this.handleFinish} />
          </View>
        </View>
      )
    } else {
      return (
        <View style={styles.root}>
          <View style={styles.row}>
            <Text style={styles.text}>{this.props.selectedValue}</Text>
            <Button title='Change' onPress={this.handleEditing} />
          </View>
        </View>
      )
    }
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
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lightText,
    width: Dimensions.get('window').width - 100,
    fontFamily: 'avenir-next',
    fontSize: 24,
    lineHeight: 27,
    color: colors.darkText,
    fontWeight: 'bold',
    letterSpacing: -1
  },
  text: {
    fontFamily: 'avenir-next',
    fontSize: 24,
    lineHeight: 27,
    color: colors.darkText,
    fontWeight: 'bold',
    letterSpacing: -1
  }
})
