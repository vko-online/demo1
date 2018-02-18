import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  Modal,
  Text,
  Button,
  Dimensions,
  TextInput
} from 'react-native'
import PropTypes from 'prop-types'
import { MapView, Location, Permissions } from 'expo'
import {
  GooglePlacesAutocomplete
} from 'react-native-google-places-autocomplete'
import querystring from 'querystring'
import { debounce, partial } from 'lodash'
import { Entypo } from '@expo/vector-icons'

import { mapStyle } from './theme.component.js'

const windowSize = Dimensions.get('window')
const deviceWidth = windowSize.width
const deviceHeight = windowSize.height
const KEY = 'AIzaSyBCELrsPsYsP-WFL0pwMCL90QryILefPak'

class LocationPicker extends Component {
  state = {
    isModalOpen: false,
    errorMessage: null,
    centerLocation: null,
    item: null,
    inputFocused: false
  };

  componentWillMount = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION)
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied'
      })
    }

    if (this.props.selectedValue) {
      const item = {
        location_text: this.props.selectedValue.location_text,
        location_lng: this.props.selectedValue.location_lng,
        location_lat: this.props.selectedValue.location_lat
      }
      this.setState({ item })
    } else {
      const devicelocation = await Location.getCurrentPositionAsync({})
      const item = {
        location_text: 'Your current location',
        location_lng: devicelocation.coords.longitude,
        location_lat: devicelocation.coords.latitude
      }
      this.setState({ item })
    }
  };

  handleClose = () => {
    this.setState({ isModalOpen: false })
  };

  handleOpen = () => {
    this.setState({ isModalOpen: true })
  };

  handleDone = () => {
    this.setState({ isModalOpen: false })
    this.props.onSelect(this.state.item)
  };

  handleSelect = (data, details = null) => {
    const item = {
      location_text: details.formatted_address,
      location_lng: details.geometry.location.lng,
      location_lat: details.geometry.location.lat
    }
    this.setState({ item })
  };

  handleTextChange = location_text => this.setState({ item: Object.assign({}, this.state.item, { location_text }) })
  handleTextStateChange = inputFocused => this.setState({ inputFocused })

  handleRegionChange = ({ latitude, longitude }) => {
    this.setState({
      item: Object.assign({}, this.state.item, {
        location_lng: longitude,
        location_lat: latitude
      })
    })
  };

  _updateLocationText = ({ latitude, longitude }) => {
    let params = {
      key: KEY,
      latlng: `${latitude},${longitude}`
    }
    let qs = querystring.stringify(params)
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?${qs}`)
      .then(res => res.json())
      .then(json => {
        console.log('json', json)
        if (json.status !== 'OK') {
          throw new Error(`Geocode error: ${json.status}`)
        }
        if (json.results.length) {
          const address = json.results[0].address_components.filter(v =>
            (v.types.includes('street_number') || v.types.includes('route'))
          )
          this.handleTextChange(address.map(v => v.short_name).join(' '))
        }
      })
  };

  updateLocationText = debounce(this._updateLocationText, 1000);

  renderPlaceholder = () => {
    return (
      <View>
        <Text>Getting location</Text>
      </View>
    )
  };

  renderMap = () => {
    return (
      <View style={styles.body}>
        <View style={styles.header}>
          <Button title='Cancel' onPress={this.handleClose} />
          <Button title='Done' onPress={this.handleDone} />
        </View>
        <MapView
          style={styles.map}
          provider={MapView.PROVIDER_GOOGLE}
          customMapStyle={mapStyle}
          region={{
            latitude: this.state.item.location_lat,
            longitude: this.state.item.location_lng,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.08
          }}
          onRegionChange={this.handleRegionChange}
          onRegionChangeComplete={this.updateLocationText}
          center={{
            latitude: this.state.item.location_lat,
            longitude: this.state.item.location_lng,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.08
          }}
        />
        {/* <View style={styles.location__info}>
          <TextInput
            style={styles.location__input}
            value={this.state.item.location_text}
          />
        </View> */}
        <GooglePlacesAutocomplete
          debounce={200}
          enablePoweredByContainer={false}
          fetchDetails
          filterReverseGeocodingByTypes={[
            'street_number',
            'route'
          ]} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
          placeholder='Search'
          query={{
            language: 'en',
            key: 'AIzaSyBCELrsPsYsP-WFL0pwMCL90QryILefPak',
            types: 'address'
          }}
          text={this.state.item.location_text}
          listViewDisplayed={this.state.inputFocused}
          renderDescription={row => row.description}
          returnKeyType={'search'}
          textInputProps={{
            onChangeText: this.handleTextChange,
            onFocus: partial(this.handleTextStateChange, true),
            onBlur: partial(this.handleTextStateChange, false)
          }}
          styles={{
            container: {
              position: 'absolute',
              top: '10%',
              left: 0,
              right: 0,
              borderRadius: 10,
              borderWidth: 0,
              padding: 0,
              margin: 0,
              marginHorizontal: 10
            },
            textInputContainer: {
              borderWidth: 0,
              padding: 0,
              margin: 0,
              backgroundColor: 'transparent'
            },
            textInput: {
              flex: 1,
              fontSize: 16,
              fontFamily: 'avenir-next',
              padding: 10,
              width: '100%',
              borderRadius: 0,
              borderWidth: 0,
              color: '#fff',
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            },
            listView: {
              backgroundColor: '#fff'
            }
          }}
          onPress={this.handleSelect}
        />
      </View>
    )
  };

  // height: deviceHeight,
  //             width: deviceWidth,
  //             position: 'absolute',
  //             top: 50
  renderStaticMarker = () => {
    return (
      <View style={styles.staticMarker}>
        <Entypo name='location' size={40} color='#fff' />
      </View>
    )
  };

  render () {
    return (
      <View style={styles.root}>
        <Modal
          visible={this.state.isModalOpen}
          animationType='slide'
          onClose={this.handleClose}
          style={styles.modal}
        >
          {!this.state.item && this.renderPlaceholder()}
          {!!this.state.item && this.renderMap()}
          {this.renderStaticMarker()}
        </Modal>
        <View style={styles.row}>
          {this.props.children}
          <Button title={this.props.text} onPress={this.handleOpen} />
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
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    position: 'relative'
  },
  header: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modal: {
    flex: 1
  },
  map: {
    flex: 1
  },
  staticMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 40,
    marginTop: -10,
    marginLeft: -10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  location__info: {
    position: 'absolute',
    bottom: '20%',
    left: 0,
    right: 0,
    borderRadius: 10,
    marginHorizontal: 10
  },
  location__input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'avenir-next',
    padding: 10,
    width: '100%',
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  }
})

LocationPicker.propTypes = {
  onSelect: PropTypes.func,
  text: PropTypes.string,
  selectedValue: PropTypes.shape({
    location_text: PropTypes.string,
    location_lng: PropTypes.number,
    location_lat: PropTypes.number
  }),
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ])
}

export default LocationPicker
