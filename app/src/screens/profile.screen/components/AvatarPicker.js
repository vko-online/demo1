import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Image, View, StyleSheet, Dimensions } from 'react-native'
import { ReactNativeFile } from 'apollo-upload-client'

import { colors } from '../../../components/theme.component'

const ImagePicker = require('react-native-image-picker')

const WIDTH = Dimensions.get('screen').width
const HEIGHT = Dimensions.get('screen').height

export default class AvatarPicker extends Component {
  static propTypes = {
    selectedValue: PropTypes.string,
    onSelect: PropTypes.func
  }

  renderImage = () => {
    const { selectedValue } = this.props
    if (selectedValue) {
      return <Image source={{ uri: selectedValue }} style={styles.image} />
    }
    return null
  }

  renderButton = () => {
    const { selectedValue } = this.props
    if (!selectedValue) {
      return <Button title='Select' onPress={this.pickImage} />
    }
    return null
  }

  render () {
    return (
      <View style={styles.container}>
        {this.renderImage()}
        {this.renderButton()}
      </View>
    )
  }

  pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [HEIGHT, WIDTH],
      mediaTypes: ImagePicker.MediaTypeOptions.Images
    })

    if (!result.cancelled) {
      const avatar = new ReactNativeFile({
        name: 'avatar',
        type: result.type,
        path: result.uri,
        uri: result.uri
      })
      this.props.onSelect(avatar)
    }
  };
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.lightText,
    width: 100,
    height: 100,
    overflow: 'hidden'
  },
  image: {
    width: 100,
    height: 100
  }
})
