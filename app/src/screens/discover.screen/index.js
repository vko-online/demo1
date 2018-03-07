import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Animated,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native'
import { graphql, compose } from 'react-apollo'
import Icon from 'react-native-vector-icons/Ionicons'
import { connect } from 'react-redux'

import Scene from '../../components/scene.component'
import { metrics } from '../../components/theme.component'
import { Heading1 } from '../../components/text.component'

import Pane from './components/Pane'
import Hint from './components/Hint'

import { USER_ALL_QUERY } from '../../graphql/user.query'
import CREATE_DECISION_MUTATION from '../../graphql/create-decision.mutation'

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e9e9ef',
    flex: 1
  },
  loading: {
    justifyContent: 'center',
    flex: 1
  },
  nodata: {
    textAlign: 'center'
  }
})

class Discover extends Component {
  static navigationOptions = {
    tabBarLabel: 'Discover',
    tabBarIcon: ({ tintColor }) => (
      <Icon color={tintColor} name='ios-search' size={30} />
    ),
    header: null
  };

  profilepane = null;
  transitionpane = null;
  sceneHeight = Dimensions.get('window').height;
  sceneWidth = Dimensions.get('window').width;
  state = {
    animValue: new Animated.Value(0),
    nextProfile: null,
    prevProfile: null,
    showIntro: true,
    incomingProfile: null,
    transitionDirection: null,
    profile: null
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.users) {
      this.setState({
        profile: nextProps.users[0],
        nextProfile: nextProps.users[1]
      })
    }
  }

  handleLayout ({ height }) {
    const availableHeight = this.sceneHeight - height

    this.profilepane.refs.summary.measure((left, top, width, height) => {
      if (availableHeight > height) {
        this.profilepane.refs.summary.setNativeProps({
          style: { minHeight: availableHeight - metrics.nextupHeight }
        })
      }
    })
  }

  handleLike = () => {
    this.props.createDecision({ personId: this.state.profile.id, status: 'liked' })
  }

  handleDislike = () => {
    this.props.createDecision({ personId: this.state.profile.id, status: 'disliked' })
  }

  handleScroll = ({ nativeEvent }) => {
    const contentHeight = nativeEvent.contentSize.height
    const viewHeight = nativeEvent.layoutMeasurement.height
    const scrollY = nativeEvent.contentOffset.y
    const heightOffset = contentHeight > viewHeight
      ? contentHeight - viewHeight
      : 0
    const {
      nextProfilePreview,
      prevProfilePreview,
      scrollview
    } = this.profilepane.refs
    const { nextProfile, prevProfile } = this.state

    if (scrollY > 0 && nextProfilePreview) {
      const opacity = Math.min((scrollY - (heightOffset + 20)) / 100, 1)
      nextProfilePreview.setNativeProps({ style: { opacity } })
    } else if (prevProfilePreview) {
      const opacity = Math.min(Math.abs(scrollY + 20) / 100, 1)
      prevProfilePreview.setNativeProps({ style: { opacity } })
    }

    const jumpToNext = nextProfile && scrollY > heightOffset + 110
    const jumpToPrev = prevProfile && scrollY < -110

    if (jumpToNext) {
      scrollview.setNativeProps({
        scrollEnabled: false,
        bounces: false
      })
      this.renderNextProfile()
    } else if (jumpToPrev) {
      scrollview.setNativeProps({
        bounces: false,
        scrollEnabled: false
      })
      this.renderPrevProfile()
    }
  };

  getNextProfileFromId = (id) => {
    const { users } = this.props
    const index = users.findIndex(u => u.id === id)
    return users[index + 1]
  }

  getPrevProfileFromId = (id) => {
    const { users } = this.props
    const index = users.findIndex(u => u.id === id)
    return users[Math.max(index - 1, 0)]
  }

  renderNextProfile = () => {
    const profile = this.state.nextProfile

    if (profile) {
      const prevProfile = this.state.profile
      const nextProfile = profile ? this.getNextProfileFromId(profile.id) : null

      this.setProfiles({ nextProfile, prevProfile, profile }, 'next')
    }
  };

  renderPrevProfile = () => {
    const profile = this.state.prevProfile

    if (profile) {
      const nextProfile = this.state.profile
      const prevProfile = profile ? this.getPrevProfileFromId(profile.id) : null

      this.setProfiles({ nextProfile, prevProfile, profile }, 'prev')
    }
  };

  setProfiles = (newState, transitionDirection) => {
    this.setState(
      {
        incomingProfile: newState.profile,
        transitionDirection
      },
      () => {
        Animated.spring(this.state.animValue, {
          toValue: 1,
          friction: 7,
          tension: 30
        }).start(() => {
          this.setState(Object.assign({}, newState), () => {
            this.state.animValue.setValue(0)
            this.profilepane.refs.scrollview.setNativeProps({
              bounces: true,
              scrollEnabled: true
            })
            this.profilepane.refs.scrollview.scrollTo({
              y: 0,
              animated: false
            })
          })
        })
      }
    )
  };

  render () {
    const { loading, users } = this.props

    if (loading || !users) {
      return (
        <View style={[styles.loading, styles.container]}>
          <ActivityIndicator />
        </View>
      )
    }

    if (!users.length) {
      return (
        <View style={[styles.loading, styles.container]}>
          <Heading1 style={styles.nodata}>No data</Heading1>
        </View>
      )
    }

    const {
      animValue,
      nextProfile,
      incomingProfile,
      prevProfile,
      profile,
      transitionDirection
    } = this.state

    const isAndroid = Platform.OS === 'android'
    const availableHeight = this.sceneHeight

    const incomingFrom = transitionDirection === 'next'
      ? this.sceneHeight
      : -this.sceneHeight
    const outgoingTo = transitionDirection === 'next'
      ? -this.sceneHeight
      : this.sceneHeight

    const transitionStyles = {
      height: availableHeight,
      position: 'absolute',
      width: this.sceneWidth
    }
    const incomingTransitionStyles = {
      transform: [
        {
          translateY: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [incomingFrom, 0]
          })
        }
      ]
    }
    const outgoingTransitionStyles = {
      transform: [
        {
          translateY: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, outgoingTo]
          })
        }
      ]
    }

    return (
      <Scene>
        <StatusBar barStyle='light-content' animated />
        <Animated.View style={[transitionStyles, outgoingTransitionStyles]}>
          <Pane
            nextProfile={nextProfile}
            prevProfile={prevProfile}
            ref={r => {
              this.profilepane = r
            }}
            visibleProfile={profile}
            onDislike={this.handleDislike}
            onHeroLayout={({ nativeEvent: { layout } }) => this.handleLayout(layout)}
            onLike={this.handleLike}
            onPressNext={this.renderNextProfile}
            onScroll={!isAndroid ? this.handleScroll : null}
          />
        </Animated.View>
        {!!incomingProfile &&
          <Animated.View
            pointerEvents='none'
            style={[transitionStyles, incomingTransitionStyles]}
          >
            <Pane
              ref={r => {
                this.transitionpane = r
              }}
              visibleProfile={incomingProfile}
            />
          </Animated.View>}

        <Hint onClose={() => this.setState({ showIntro: false })} />
      </Scene>
    )
  }
}
Discover.propTypes = {
  loading: PropTypes.bool,
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      email: PropTypes.string.isRequired
    })
  ),
  createDecision: PropTypes.func
}

const usersQuery = graphql(USER_ALL_QUERY, {
  skip: ownProps => !ownProps.auth || !ownProps.auth.jwt,
  props: ({ data: { users } }) => ({
    users
  })
})

const createDecisionMutation = graphql(CREATE_DECISION_MUTATION, {
  props: ({ ownProps, mutate }) => ({
    createDecision: decision =>
      mutate({
        variables: { decision }
      })
  })
})

const mapStateToProps = ({ auth, filter }) => ({
  auth,
  filter
})

export default compose(
  connect(mapStateToProps),
  usersQuery,
  createDecisionMutation
)(Discover)
