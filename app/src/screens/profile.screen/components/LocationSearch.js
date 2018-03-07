import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  Modal,
  Text,
  Button,
  Dimensions
} from 'react-native'
import PropTypes from 'prop-types'
import {
  GooglePlacesAutocomplete
} from 'react-native-google-places-autocomplete'

const windowSize = Dimensions.get('window')
const deviceWidth = windowSize.width
const deviceHeight = windowSize.height

export default class LocationSearch extends Component {
  static propTypes = {
    onSelect: PropTypes.func,
    children: PropTypes.element
  }

  state = {
    isModalOpen: false,
    item: null
  };

  handleClose = () => {
    this.setState({ isModalOpen: false })
  };

  handleOpen = () => {
    this.setState({ isModalOpen: true })
  };

  handleDone = () => {
    this.setState({ isModalOpen: false }, () => this.props.onSelect(this.state.item))
  };

  handleSelect = (data, details = null) => {
    this.setState({ item: details.formatted_address })
  };

  render () {
    return (
      <View style={styles.root}>
        <Modal visible={this.state.isModalOpen} onClose={this.handleClose}>
          <View style={styles.body}>
            <View style={styles.header}>
              <Button title='Cancel' onPress={this.handleClose} />
              <Text>Location</Text>
              <Button title='Done' onPress={this.handleDone} />
            </View>
            <GooglePlacesAutocomplete
              autoFocus
              debounce={200}
              enablePoweredByContainer={false}
              fetchDetails
              filterReverseGeocodingByTypes={[
                'locality',
                'administrative_area_level_3'
              ]} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
              placeholder='Search'
              query={{
                language: 'en',
                key: 'AIzaSyBCELrsPsYsP-WFL0pwMCL90QryILefPak',
                types: '(cities)'
              }}
              renderDescription={row => row.description}
              returnKeyType={'search'}
              styles={{
                listView: {
                  height: deviceHeight,
                  width: deviceWidth,
                  position: 'absolute',
                  top: 50
                }
              }}
              onPress={this.handleSelect}
            />
          </View>
        </Modal>
        <View style={styles.row}>
          {this.props.children}
          <Button title='Change' onPress={this.handleOpen} />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  root: {
    flex: 1
  },
  body: {
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
  }
})
