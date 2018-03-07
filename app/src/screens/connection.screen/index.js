import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  FlatList,
  ActivityIndicator,
  Text,
  Modal,
  Dimensions,
  ScrollView,
  View,
  StatusBar
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Ionicons'
import { graphql, compose } from 'react-apollo'
import { partial } from 'lodash'
import { connect } from 'react-redux'
import ImageSlider from 'react-native-image-slider'

import { USER_QUERY } from '../../graphql/user.query'

import MatchView from './components/MatchView'
import styles from './styles'

const MARGIN_VERTICAL = 30
const AVAILABLE_HEIGHT = Dimensions.get('screen').height - MARGIN_VERTICAL * 2

class Connection extends Component {
  static navigationOptions = {
    title: 'Connections',
    header: null
  };

  state = {
    activeProfile: null,
    isModalOpen: false,
    isScrolling: false,
    phone: '+7 775 3955972'
  };

  onRefresh = () => {
    this.props.refetch()
  };

  keyExtractor = item => item.id;

  goToMessages = match => {
    const { navigate } = this.props.navigation
    navigate('Messages', {
      matchId: match.id
    })
  };

  openProfile = activeProfile => this.setState({ activeProfile, isModalOpen: true })

  renderItem = ({ item }) => {
    const { user } = this.props
    return (
      <MatchView
        item={item}
        user={user}
        onAvatarPress={partial(this.openProfile, item)}
        onPress={partial(this.goToMessages, item)}
      />
    )
  }

  renderPlaceholder = () => {
    const { isScrolling } = this.state

    if (isScrolling) {
      return (
        <Icon
          color='#aaa'
          name={'ios-arrow-down'}
          size={40}
          style={styles.placeholderScrolling}
        />
      )
    } else {
      return <View style={styles.placeholder} />
    }
  };

  handleClose = () => this.setState({ isModalOpen: false });

  handleScrollEnd = () => this.setState({ isScrolling: false });

  handleScroll = ({ nativeEvent }) => {
    this.setState({ isScrolling: true })
    const scrollY = nativeEvent.contentOffset.y

    const shouldClose = scrollY < -100
    if (shouldClose) {
      this.refs.scrollview.setNativeProps({
        bounces: false,
        scrollEnabled: false
      })
      this.setState({ isScrolling: false })
      this.handleClose()
    }
  };

  renderModalContent = () => {
    const { activeProfile } = this.state
    const images = [require('../../assets/images/girls/1s.jpeg'), require('../../assets/images/girls/1s.jpeg')]
    if (activeProfile) {
      return (
        <ScrollView
          ref='scrollview'
          scrollEventThrottle={60}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={styles.body}
          onMomentumScrollEnd={this.handleScrollEnd}
          onScroll={this.handleScroll}
        >
          <View style={styles.card}>
            {this.renderPlaceholder()}
            <ImageSlider
              height={AVAILABLE_HEIGHT}
              images={images}
              style={styles.profileImage}
            />
            <LinearGradient
              colors={['transparent', '#000']}
              end={{ x: 0, y: 1 }}
              pointerEvents='box-none'
              start={{ x: 0, y: 0.3 }}
              style={styles.gradient}
            >
              <View pointerEvents='none' style={styles.info}>
                <Text style={styles.info__age}>{activeProfile.age}</Text>
                <Text style={styles.info__name}>{activeProfile.username}</Text>
                <Text style={styles.info__location}>{activeProfile.location}</Text>
                <Text style={styles.info__status}>{activeProfile.status}</Text>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      )
    }
    return null
  };

  render () {
    const { isModalOpen } = this.state
    const { user, loading, networkStatus } = this.props
    let content
    // render loading placeholder while we fetch messages
    if (loading || !user || !user.matches) {
      content = (
        <View style={[styles.loading, styles.container]}>
          <ActivityIndicator />
        </View>
      )
    } else {
      content = (
        <View style={styles.container}>
          <StatusBar barStyle='light-content' animated />
          <FlatList
            data={user.matches}
            keyExtractor={this.keyExtractor}
            renderItem={this.renderItem}
            onRefresh={this.onRefresh}
            refreshing={networkStatus === 4}
          />

          <Modal
            animationType='slide'
            transparent
            visible={isModalOpen}
            onClose={this.handleClose}
          >
            {this.renderModalContent()}
          </Modal>
        </View>
      )
    }

    return (
      <View style={styles.root}>
        {content}
      </View>
    )
  }
}
Connection.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func
  }),
  loading: PropTypes.bool,
  networkStatus: PropTypes.number,
  refetch: PropTypes.func,
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    email: PropTypes.string.isRequired,
    matches: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        users: PropTypes.arrayOf(PropTypes.shape({
          id: PropTypes.number,
          username: PropTypes.string,
          age: PropTypes.number,
          gender: PropTypes.string,
          location: PropTypes.string,
          status: PropTypes.string
        }))
      })
    )
  })
}

const userQuery = graphql(USER_QUERY, {
  skip: ownProps => !ownProps.auth || !ownProps.auth.jwt,
  options: ownProps => ({ variables: { id: ownProps.auth.id } }),
  props: ({ data: { loading, networkStatus, refetch, user } }) => ({
    loading,
    networkStatus,
    refetch,
    user
  })
})

const mapStateToProps = ({ auth, filter }) => ({
  auth,
  filter
})

export default compose(
  connect(mapStateToProps),
  userQuery
)(Connection)
