import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  Modal,
  Button,
  FlatList,
  Text,
  TouchableOpacity
} from 'react-native'
import PropTypes from 'prop-types'

import { colors } from '../../../components/theme.component'

export default class Picker extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.string),
    selectedValue: PropTypes.string,
    title: PropTypes.string,
    onSelect: PropTypes.func,
    children: PropTypes.element
  }

  state = {
    isModalOpen: false,
    item: null
  };

  handleSelect = item => {
    this.setState({ item })
  };

  handleClose = () => {
    this.setState({ isModalOpen: false })
  };

  handleOpen = () => {
    this.setState({ isModalOpen: true })
  }

  handleDone = () => {
    this.setState({ isModalOpen: false })
    this.props.onSelect(this.state.item)
  };

  renderItem = ({ item }) => {
    const { selectedValue } = this.props

    const selected = this.state.item || selectedValue

    const isSelected = item === selected

    if (isSelected) {
      return (
        <TouchableOpacity
          style={[styles.option, styles.selected]}
          onPress={() => this.handleSelect(item)}
        >
          <Text style={styles.optionText}>{item}</Text>
        </TouchableOpacity>
      )
    }
    return (
      <TouchableOpacity style={styles.option} onPress={() => this.handleSelect(item)}>
        <Text style={styles.optionText}>{item}</Text>
      </TouchableOpacity>
    )
  };

  render () {
    const { isModalOpen } = this.state
    const { title, items } = this.props
    return (
      <View style={styles.root}>
        <Modal
          transparent
          visible={isModalOpen}
          onClose={this.handleClose}
        >
          <View style={styles.content}>
            <View style={styles.body}>
              <View style={styles.header}>
                <Button title='Cancel' onPress={this.handleClose} />
                <Text>{title}</Text>
                <Button title='Done' onPress={this.handleDone} />
              </View>
              <FlatList
                data={items}
                extraData={this.state.item}
                keyExtractor={i => i}
                renderItem={this.renderItem}
                style={styles.list}
                contentContainerStyle={styles.listContainer}
              />
            </View>
          </View>
        </Modal>
        <View style={styles.row}>
          {this.props.children}
          <Button style={styles.toggle} title='Change' onPress={this.handleOpen} />
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
  },
  placeholder: {
    backgroundColor: 'yellow'
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  body: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center'
  },
  header: {
    backgroundColor: '#fff',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  list: {
    backgroundColor: '#fff',
    height: 220
  },
  listContainer: {
    paddingBottom: 20
  },

  option: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20
  },
  selected: {
    backgroundColor: 'black'
  },
  optionText: {
    color: colors.lightText,
    fontSize: 18,
    fontFamily: 'avenir-next'
  }
})
