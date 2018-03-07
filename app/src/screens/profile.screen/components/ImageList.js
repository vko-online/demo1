import React, { Component } from 'react'
import {
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  View,
  Alert,
  Button
} from 'react-native'
import PropTypes from 'prop-types'
import { ReactNativeFile } from 'apollo-upload-client'
import Icon from 'react-native-vector-icons/Ionicons'

import { colors } from '../../../components/theme.component'

const ImagePicker = require('react-native-image-picker')

class ListItem extends Component {
  static propTypes = {
    avatar: PropTypes.string,
    item: PropTypes.string,
    onRemove: PropTypes.func,
    onSelect: PropTypes.func
  };

  confirmAction = item => {
    Alert.alert(
      'Deleting image',
      'Are you sure you want to delete this image?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        { text: 'Yes', onPress: () => this.props.onRemove(item) }
      ],
      { cancelable: false }
    )
  };

  renderMakeDefault = item => {
    const { avatar } = this.props
    const isSame = avatar === item

    if (!isSame) {
      return (
        <Button
          title='Make default'
          onPress={() => this.props.onSelect(item)}
        />
      )
    }
    return <Button disabled title='Default' onPress={() => {}} />
  };

  render () {
    const { avatar, item } = this.props
    const isSame = avatar === item
    return (
      <View style={styles.imageRoot}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item }}
            style={styles.image}
          />
          {!isSame && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => this.confirmAction(item)}
            >
              <Icon color={'#333'} name={'ios-close'} size={30} />
            </TouchableOpacity>
          )
          }
        </View>
        {this.renderMakeDefault(item)}
      </View>
    )
  }
}

export default class ImageList extends Component {
  static propTypes = {
    avatar: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.string),
    itemsRaw: PropTypes.arrayOf(PropTypes.string),
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    onSelectAvatar: PropTypes.func
  };

  static defaultProps = {
    items: []
  }

  pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      aspect: [4, 3]
    })

    if (!result.cancelled) {
      const image = new ReactNativeFile({
        name: 'image',
        type: result.type,
        path: result.uri,
        uri: result.uri
      })
      this.props.onAdd(image)
    }
  };

  handleRemove = img => {
    const { items, itemsRaw } = this.props
    const index = items.indexOf(img)

    this.props.onRemove(itemsRaw[index])
  }

  handleAvatarSelect = img => {
    const { items, itemsRaw } = this.props
    const index = items.indexOf(img)

    this.props.onSelectAvatar(itemsRaw[index])
  }

  renderItem = ({ item }) => {
    if (item === 'add') {
      return (
        <TouchableOpacity style={styles.addButton} onPress={this.pickImage}>
          <Icon color={'#333'} name={'ios-add'} size={50} />
        </TouchableOpacity>
      )
    }
    return (
      <ListItem
        avatar={this.props.avatar}
        item={item}
        key={item}
        onRemove={this.handleRemove}
        onSelect={this.handleAvatarSelect}
      />
    )
  };
  render () {
    return (
      <View style={styles.root}>
        <FlatList
          data={this.props.items.concat('add')}
          keyExtractor={img => img}
          numColumns={3}
          renderItem={this.renderItem}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  container: {
    flex: 1
  },
  list: {
    flex: 1
  },
  image: {
    width: 110,
    height: 110,
    margin: 10
  },
  imageRoot: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -40
  },
  addButton: {
    width: 110,
    height: 110,
    margin: 10,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center'
  },
  default: {
    color: colors.lightText
  }
})
