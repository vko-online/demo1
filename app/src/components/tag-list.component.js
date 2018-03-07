import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { partial } from 'lodash'
import Icon from 'react-native-vector-icons/Ionicons'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  list: {
    height: 84
  },
  list__footer: {
    color: 'lightblue',
    padding: 5
  },
  tagsContainer: {
    paddingTop: 10,
    paddingHorizontal: 5
  },
  tag: {
    margin: 5,
    height: 54,
    width: 90,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  tag__img: {
    borderRadius: 5,
    height: 54,
    width: 90
  },
  tag__overlay: {
    borderRadius: 5,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    height: 54,
    width: 90
  },
  tag__name: {
    color: '#fff'
  },
  tag__selected: {
    position: 'absolute',
    top: 3,
    right: 5
  }
})

class TagItem extends Component {
  renderIcon = () => {
    return (
      <Icon
        color={'#fff'}
        name='ios-checkmark-circle'
        size={20}
        style={styles.tag__selected}
      />
    )
  };
  render () {
    const { item, onPress, isSelected } = this.props

    return (
      <TouchableOpacity activeOpacity={0.7} style={styles.tag} onPress={onPress}>
        <Image source={{ uri: item.url }} style={styles.tag__img} cache={'force-cache'} />
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 1)']}
          style={styles.tag__overlay}
        >
          <Text numberOfLines={1} style={styles.tag__name}>{item.name}</Text>
        </LinearGradient>
        {isSelected && this.renderIcon() }
      </TouchableOpacity>
    )
  }
}
TagItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    url: PropTypes.string
  }),
  onPress: PropTypes.func,
  isSelected: PropTypes.bool
}

class TagList extends Component {
  state = {
    activeTags: this.props.selected || []
  };

  toggle = item => {
    const isSelected = this.state.activeTags.map(v => v.id).includes(item.id)
    if (isSelected) {
      this.setState({
        activeTags: this.state.activeTags.filter(v => v.id !== item.id)
      }, () => this.props.onChange(this.state.activeTags))
    } else {
      this.setState({ activeTags: [item, ...this.state.activeTags] }, () => this.props.onChange(this.state.activeTags))
    }
  };
  keyExtractor = item => item.id;

  renderItem = ({ item }) => {
    const isSelected = this.state.activeTags.map(v => v.id).includes(item.id)
    return (
      <TagItem
        item={item}
        isSelected={isSelected}
        onPress={partial(this.toggle, item)}
      />
    )
  };

  renderFooter = () => {
    if (!this.state.activeTags.length) return null
    return (
      <Text style={styles.list__footer}>{this.state.activeTags.length} selected</Text>
    )
  }

  render () {
    return (
      <View style={styles.container}>
        {/* {this.renderFooter()} */}
        <FlatList
          contentContainerStyle={styles.tagsContainer}
          extraData={this.state.activeTags}
          style={styles.list}
          data={this.props.data}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderItem}
        />
      </View>
    )
  }
}
TagList.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      url: PropTypes.string
    })
  ),
  selected: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      url: PropTypes.string
    })
  ),
  onChange: PropTypes.func
}

export default TagList
