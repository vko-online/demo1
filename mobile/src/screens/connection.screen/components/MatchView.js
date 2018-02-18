import React, { Component } from 'react'
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'

import { Heading1, Heading2 } from '../../../components/text.component'

export default class MatchView extends Component {
  static propTypes = {
    item: PropTypes.object,
    user: PropTypes.object,
    onPress: PropTypes.func,
    onAvatarPress: PropTypes.func
  };

  renderImage = () => {
    const { user, item } = this.props
    const oppositeUsers = item.users.filter(u => u.id !== user.id)
    const oppositeUser = oppositeUsers[0]
    if (oppositeUser.avatar) {
      return <Image source={{uri: oppositeUser.avatar}} style={styles.image} />
    }
    return <Image source={require('../../../assets/images/no.jpg')} style={styles.image__no} />
  }

  render () {
    const { user, item, onPress, onAvatarPress } = this.props

    const oppositeUsers = item.users.filter(u => u.id !== user.id)
    const oppositeUser = oppositeUsers[0]

    return (
      <TouchableOpacity onPress={onPress}>
        <View style={styles.container}>
          <TouchableOpacity onPress={onAvatarPress}>
            {this.renderImage()}
          </TouchableOpacity>
          <View style={styles.body}>
            <Heading1>{oppositeUser.username}, {oppositeUser.age}</Heading1>
            <Heading2>{oppositeUser.location}, {oppositeUser.status}</Heading2>
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 5
  },
  image__no: {
    width: 80,
    height: 80,
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#666'
  },
  body: {
    marginLeft: 20,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start'
  }
})
