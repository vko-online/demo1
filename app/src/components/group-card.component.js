import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { isUndefined } from 'lodash'

import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'

import { Text, Heading1 } from './text.component'
import { colors, formatDate } from './theme.component'

// format createdAt with moment

class GroupCard extends Component {
  placeholders = [
    require('../assets/images/fractal-0.jpg'),
    require('../assets/images/fractal-1.jpg'),
    require('../assets/images/fractal-2.jpg'),
    require('../assets/images/fractal-3.jpg'),
    require('../assets/images/exterior-0.jpg'),
    require('../assets/images/exterior-1.jpg'),
    require('../assets/images/exterior-2.jpg'),
    require('../assets/images/exterior-3.jpg'),
    require('../assets/images/interior-0.jpg'),
    require('../assets/images/interior-1.jpg'),
    require('../assets/images/interior-2.jpg'),
    require('../assets/images/interior-3.jpg')
  ]

  renderImage = () => {
    const image = this.props.group.icon

    if (image) {
      return (
        <Image
          resizeMode='cover'
          source={{ uri: image }}
          style={styles.coverImage}
        />
      )
    }
    return (
      // <View style={styles.imagePlaceholder} />
      <Image
        resizeMode='cover'
        source={this.placeholders[Math.floor(Math.random() * this.placeholders.length)]}
        style={styles.coverImage}
      />
    )
  };

  renderIcon = () => {
    const { isFollowing, onAddSaved, onRemoveSaved } = this.props
    const showFollowIcon = !isUndefined(isFollowing)

    if (showFollowIcon) {
      if (isFollowing) {
        return (
          <TouchableOpacity onPress={onRemoveSaved}>
            <Icon
              color={'rgba(255, 255, 255, 0.6)'}
              name='ios-star'
              size={30}
              style={styles.addToListIcon}
            />
          </TouchableOpacity>
        )
      } else {
        return (
          <TouchableOpacity onPress={onAddSaved}>
            <Icon
              color={'rgba(255, 255, 255, 0.6)'}
              name='ios-star-outline'
              size={30}
              style={styles.addToListIcon}
            />
          </TouchableOpacity>
        )
      }
    }

    return <View />
  };

  handlePress = () => {
    this.props.onPress(this.props.group)
  };

  render () {
    const { group } = this.props

    return (
      <TouchableOpacity style={styles.container} onPress={this.handlePress}>
        {this.renderImage()}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.95)',
            'rgba(255, 255, 255, 0.8)',
            'transparent'
          ]}
          end={{ x: 1, y: 1 }}
          locations={[0, 0.2, 1]}
          pointerEvents='box-none'
          start={{ x: 0.3, y: 0.7 }}
          style={styles.body}
        >
          <View style={styles.overlay}>
            <View style={styles.leftColumn}>
              <Heading1 numberOfLines={2} style={styles.title}>
                {group.name}
              </Heading1>
              <Text numberOfLines={1} style={styles.categoryText}>
                {group.tags.map(v => v.name).join(', ').toUpperCase()}
              </Text>
            </View>
            <View style={styles.rightRow}>
              {this.renderIcon()}
              <View style={styles.rightRowItemContainer}>
                <View style={styles.rightRowItem}>
                  <Text style={styles.dateText}>
                    {formatDate(group.date)}
                  </Text>
                </View>
                <View style={styles.rightRowItem}>
                  <Text numberOfLines={1} style={styles.locationText}>
                    {group.location_text}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    )
  }
}

GroupCard.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.number,
    icon: PropTypes.string,
    name: PropTypes.string,
    messages: PropTypes.shape({
      edges: PropTypes.arrayOf(
        PropTypes.shape({
          cursor: PropTypes.string,
          node: PropTypes.object
        })
      )
    }),
    unreadCount: PropTypes.number
  }),
  isFollowing: PropTypes.bool,
  onPress: PropTypes.func,
  onAddSaved: PropTypes.func,
  onRemoveSaved: PropTypes.func
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 3,
    marginBottom: 10
  },
  coverImage: {
    height: 100,
    width: '100%',
    borderRadius: 3
  },
  imagePlaceholder: {
    height: 100,
    width: '100%',
    backgroundColor: 'black'
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  body: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderRadius: 3
  },
  title: {
    // color: colors.white
    fontFamily: 'markweb'
  },
  rightRowItemContainer: {
    backgroundColor: 'rgba(0,0,0,.2)',
    borderRadius: 3
  },
  rightRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 2,
    paddingHorizontal: 5
  },
  leftColumn: {
    flex: 1,
    padding: 5,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  rightRow: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  },
  categoryText: {
    color: colors.lightRed,
    fontSize: 12
  },
  dateText: {
    color: colors.white
  },
  locationText: {
    color: colors.white
  },
  info__peopleGoingText: {
    color: colors.white
  },
  followText: {
    color: '#rgba(248, 68, 68, 0.6)'
  },
  addToListIcon: {
    lineHeight: 30,
    marginRight: 5
  }
})

export default GroupCard
