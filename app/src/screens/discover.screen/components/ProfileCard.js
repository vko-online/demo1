import React, { Component } from 'react'
import {
  StyleSheet,
  Image,
  View,
  Dimensions,
  Button
} from 'react-native'
import PropTypes from 'prop-types'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'

import ImageSlider from 'react-native-image-slider'

import { colors } from '../../../components/theme.component'
import { Text } from '../../../components/text.component'

export default class ProfileCard extends Component {
  static propTypes = {
    profile: PropTypes.object,
    onLike: PropTypes.func,
    onDislike: PropTypes.func
  };

  renderImage = (data) => <Image source={{ uri: data }} style={styles.slider} />

  renderOnline () {
    if (this.props.profile.online) {
      return (
        <Icon
          color={colors.lightGreen}
          name={'ios-radio-button-on'}
          size={14}
          style={styles.online_icon}
        />
      )
    }
    return (
      <Icon
        color={colors.lightGreen}
        name={'ios-radio-button-off'}
        size={14}
        style={styles.online_icon}
      />
    )
  }

  handleLike = () => {
    this.props.onLike && this.props.onLike()
  }

  handleDislike = () => {
    this.props.onDislike && this.props.onDislike()
  }

  render () {
    const { profile } = this.props
    const images = profile.imagesPublic.length ? profile.imagesPublic : [require('../../../assets/images/girls/1s.jpeg')]
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ImageSlider
            height={AVAILABLE_HEIGHT}
            images={images}
            style={styles.slider}
          />
          <LinearGradient
            colors={['transparent', '#000']}
            end={{ x: 0, y: 1 }}
            pointerEvents='box-none'
            start={{ x: 0, y: 0.3 }}
            style={styles.body}
          >
            <View pointerEvents='none' style={styles.info}>
              <Text style={styles.info__age}>{profile.age}</Text>
              <View style={styles.info__online}>
                {this.renderOnline()}
                <Text style={styles.info__name}>{profile.username}</Text>
              </View>
              <Text style={styles.info__location}>{profile.location}</Text>
              <Text style={styles.info__status}>{profile.status}</Text>
            </View>
            <View style={styles.actions}>
              <Button style={styles.action__button} title='Dislike' onPress={this.handleDislike} />
              <Button style={styles.action__button} title='Like' onPress={this.handleLike} />
            </View>
          </LinearGradient>
        </View>
      </View>
    )
  }
}
const MARGIN = 0
const AVAILABLE_WIDTH = Dimensions.get('screen').width - MARGIN * 2
const AVAILABLE_HEIGHT = Dimensions.get('screen').height - MARGIN * 2

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    margin: MARGIN,
    overflow: 'hidden',
    backgroundColor: '#fff'
  },
  body: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'flex-end'
  },
  image: {
    width: AVAILABLE_WIDTH
  },
  slider: {
    height: AVAILABLE_HEIGHT,
    width: AVAILABLE_WIDTH
  },
  info: {
    marginBottom: 50,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: 'transparent'
  },
  info__age: {
    marginLeft: 60,
    fontSize: 60,
    color: '#fff',
    fontFamily: 'Avenir Next'
  },
  info__name: {
    fontSize: 40,
    color: '#fff',
    fontFamily: 'Avenir Next'
  },
  info__status: {
    marginLeft: 60,
    fontSize: 20,
    marginTop: 5,
    color: colors.lightRed,
    fontWeight: '600'
  },
  info__location: {
    marginLeft: 60,
    marginTop: -15,
    fontSize: 20,
    color: colors.lightText,
    fontWeight: '600'
  },
  info__online: {
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  online_icon: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 30,
    width: 50,
    height: 50
  },
  actions: {
    zIndex: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  action__button: {
    backgroundColor: 'transparent'
  }
})
