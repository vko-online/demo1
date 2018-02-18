import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Text,
  Modal,
  Dimensions,
  ScrollView,
  Button,
  View,
  StatusBar
} from 'react-native'
import { LinearGradient } from 'expo'
import { Ionicons } from '@expo/vector-icons'
import { graphql, compose } from 'react-apollo'
import { partial } from 'lodash'
import { connect } from 'react-redux'
import Communications from 'react-native-communications'
import ImageSlider from 'react-native-image-slider'

import { USER_QUERY } from '../../graphql/user.query'

// import Scene from '../../components/scene.component'
import { colors, metrics } from '../../components/theme.component'

import MatchView from './components/MatchView'

const MARGIN_VERTICAL = 30
const MARGIN_HORIZONTAL = 20
const AVAILABLE_WIDTH = Dimensions.get('screen').width - MARGIN_HORIZONTAL * 2
const AVAILABLE_HEIGHT = Dimensions.get('screen').height - MARGIN_VERTICAL * 2

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.chocolate
  },
  container: {
    flex: 1,
    marginTop: metrics.navbarHeight + metrics.statusBarHeight,
    backgroundColor: '#fff'
  },
  loading: {
    justifyContent: 'center',
    flex: 1
  },
  body: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  gradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 5,
    justifyContent: 'flex-end'
  },
  card: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginHorizontal: MARGIN_HORIZONTAL,
    marginVertical: MARGIN_VERTICAL,
    paddingTop: 0,
    overflow: 'hidden',
    alignItems: 'center'
  },
  placeholder: {
    backgroundColor: '#aaa',
    marginTop: 12.5,
    marginBottom: -30 + 12.5,
    zIndex: 1,
    height: 5,
    width: 30
  },
  placeholderScrolling: {
    marginBottom: -30,
    zIndex: 1,
    backgroundColor: 'transparent',
    height: 30,
    width: 30
  },
  profileImage: {
    height: AVAILABLE_HEIGHT,
    width: AVAILABLE_WIDTH
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.lightRed
  },
  phoneActions: {
    zIndex: 10,
    marginVertical: 20,
    marginHorizontal: 30,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  info: {
    marginLeft: 40
  },
  info__name: {
    backgroundColor: 'transparent',
    fontSize: 40,
    color: '#fff',
    fontFamily: 'brandon'
  },
  info__location: {
    backgroundColor: 'transparent',
    fontSize: 20,
    color: colors.lightText
  },
  info__age: {
    backgroundColor: 'transparent',
    fontSize: 60,
    color: '#fff',
    fontFamily: 'brandon'
  },
  info__status: {
    backgroundColor: 'transparent',
    fontSize: 20,
    color: colors.lightRed
  },
  info__phone: {
    backgroundColor: 'transparent',
    fontSize: 20,
    color: colors.lightText
  }
})

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
        <Ionicons
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

  handleCall = () => Communications.phonecall(this.state.phone, false)

  handleText = () => Communications.text(this.state.phone)

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
              <View style={styles.phoneActions}>
                <Button title='Call' onPress={this.handleCall} />
                <Text style={styles.info__phone}>{this.state.phone}</Text>
                <Button title='Text' onPress={this.handleText} />
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
    if (loading || !user.matches) {
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
