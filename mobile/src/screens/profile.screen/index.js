import React, { Component } from 'react'
import {
  StyleSheet,
  ActivityIndicator,
  View,
  ViewPropTypes,
  Button
} from 'react-native'
import PropTypes from 'prop-types'
// import moment from 'moment'
import { connect } from 'react-redux'
import { graphql, compose } from 'react-apollo'
import Spinner from 'react-native-loading-spinner-overlay'

import Scene from '../../components/scene.component'
import { colors, metrics } from '../../components/theme.component'
import { Text, Heading1, Heading2 } from '../../components/text.component'

import { USER_QUERY } from '../../graphql/user.query'
import {
  UPDATE_USER_MUTATION,
  REMOVE_USER_IMAGE_MUTATION
} from '../../graphql/update-user.mutation'

import { setCurrentUser, logout } from '../../actions/auth.actions'

import AvatarPicker from './components/AvatarPicker'
import LocationSearch from './components/LocationSearch'
// import DatePicker from './components/DatePicker'
import ImageList from './components/ImageList'
import StatusPicker from './components/StatusPicker'
import NameChanger from './components/NameChanger'

const PADDING_HORIZONTAL = 15
const STATUSES = ['Friendship', 'Open Relationship', 'DTF', 'FWT']

const SectionHeader = ({ title }) => {
  return (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderText}>
        {title}
      </Text>
    </View>
  )
}

SectionHeader.propTypes = {
  title: PropTypes.string
}

const SectionContent = ({ isRow, children, style }) => {
  let ownStyle = isRow
    ? styles.sectionContentContainerRow
    : styles.sectionContentContainer
  return (
    <View style={[ownStyle, style]}>
      {children}
    </View>
  )
}

SectionContent.propTypes = {
  isRow: PropTypes.bool,
  children: PropTypes.element,
  style: ViewPropTypes.style
}

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
  content: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  body: {
    marginTop: 20
  },
  info: {
    marginLeft: 10
  },
  info__name: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lightText,
    borderStyle: 'dashed'
  },
  info__location: {
    lineHeight: 20,
    color: colors.lightText,
    fontWeight: '600'
  },
  info__age: {},
  info__status: {
    color: colors.lightRed,
    fontWeight: '600'
  },
  sectionHeaderContainer: {
    backgroundColor: '#fbfbfb',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ededed'
  },
  sectionHeaderText: {
    fontSize: 14,
    color: colors.lightText
  },
  sectionContentContainer: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: PADDING_HORIZONTAL
  },
  sectionContentContainerRow: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: PADDING_HORIZONTAL,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
})

class Profile extends Component {
  static navigationOptions = {
    title: 'Profile',
    header: null
  };

  state = {
    updating: false,
    images: [
      {
        imageUrl: 'https://scontent-sea1-1.cdninstagram.com/t51.2885-15/s640x640/sh0.08/e35/14276382_1737295453196749_1335762274_n.jpg?ig_cache_key=MTMzNDMzMDE3NTk0MDQyMDQ4Ng%3D%3D.2',
        width: 480,
        height: 480
      },
      {
        imageUrl: 'https://scontent-sea1-1.cdninstagram.com/t51.2885-15/e15/14448401_926765740761369_3613737894616760320_n.jpg?ig_cache_key=MTM0NDQ0OTEzNDI0OTIxMzgzNA%3D%3D.2',
        width: 640,
        height: 640
      },
      {
        imageUrl: 'https://scontent-sea1-1.cdninstagram.com/t51.2885-15/s640x640/sh0.08/e35/14272256_1576830565957175_619863550_n.jpg?ig_cache_key=MTMzOTMwNzg3OTc3NzI1MTQzMA%3D%3D.2',
        width: 640,
        height: 640
      }
    ]
  };

  handleStatusSelect = status => this.setState({ status }, this.updateUser);
  handleLocationSelect = location =>
    this.setState({ location }, this.updateUser);
  handleNameSubmit = username => this.setState({ username }, this.updateUser);
  handleAvatarSelect = avatar => this.setState({ avatar }, this.updateUser);
  handleAvatarSourceSelect = avatarSource => this.setState({ avatarSource }, this.updateUser);
  handleImageSelect = image => this.setState({ image }, this.updateUser);

  handleImageRemove = val => {
    this.props.removeUserImage({ image: val }).then(({
      data: { removeUserImage }
    }) => {
      this.props.dispatch(setCurrentUser(removeUserImage))
      this.cancel()
    })
  };

  handleLogout = () => {
    this.props.dispatch(logout())
  }

  cancel = () => {
    this.setState({
      avatar: null,
      avatarSource: null,
      image: null,
      status: null,
      location: null,
      username: null,
      updating: false
    })
  };

  updateUser = () => {
    const { image, avatar, avatarSource, username, status, location } = this.state
    this.setState({ updating: true })
    this.props.updateUser({ image, avatar, avatarSource, username, status, location }).then(({
      data: { updateUser }
    }) => {
      this.props.dispatch(setCurrentUser(updateUser))
      this.cancel()
    })
  };

  render () {
    const { loading, user } = this.props
    if (loading || !user) {
      return (
        <View style={[styles.loading, styles.container]}>
          <ActivityIndicator />
        </View>
      )
    }

    return (
      <View style={styles.root}>
        <Scene scroll style={styles.container}>
          <Spinner visible={this.state.updating} />
          <View style={styles.content}>
            <AvatarPicker
              selectedValue={user.avatar}
              onSelect={this.handleAvatarSelect}
            />
            <View style={styles.info}>
              <Heading1 style={styles.info__name}>{user.username}</Heading1>
              <Heading2 style={styles.info__location}>
                {user.location}
              </Heading2>
            </View>
          </View>
          <View style={styles.body}>
            <SectionHeader title='Name' />
            <SectionContent isRow>
              <NameChanger
                selectedValue={user.username}
                onSubmit={this.handleNameSubmit}
              />
            </SectionContent>

            <SectionHeader title='Status' />
            <SectionContent>
              <StatusPicker
                items={STATUSES}
                selectedValue={user.status}
                title='Status'
                onSelect={this.handleStatusSelect}
              >
                <Heading2 style={styles.info__status}>
                  {user.status}
                </Heading2>
              </StatusPicker>
            </SectionContent>

            <SectionHeader title='Location' />
            <SectionContent>
              <LocationSearch onSelect={this.handleLocationSelect}>
                <Heading2 style={styles.info__location}>
                  {user.location}
                </Heading2>
              </LocationSearch>
            </SectionContent>

            {/* <SectionHeader title='Date of Birth' />
            <SectionContent>
              <DatePicker
                selectedValue={this.state.dob}
                onSelect={this.handleDateSelect}
              >
                <Text style={styles.info__age}>
                  {moment(this.state.dob).format('DD MMM YYYY')}
                </Text>
              </DatePicker>
            </SectionContent> */}

            <SectionHeader title='Photos' />
            <SectionContent style={{ paddingHorizontal: 0 }}>
              <ImageList
                avatar={user.avatar}
                itemsRaw={user.images}
                items={user.imagesPublic}
                onAdd={this.handleImageSelect}
                onRemove={this.handleImageRemove}
                onSelectAvatar={this.handleAvatarSourceSelect}
              />
            </SectionContent>
            <Button title='Logout' onPress={this.handleLogout} />
          </View>
        </Scene>
      </View>
    )
  }
}

Profile.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  auth: PropTypes.shape({
    loading: PropTypes.bool,
    jwt: PropTypes.string
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  updateUser: PropTypes.func,
  removeUserImage: PropTypes.func,
  user: PropTypes.shape({
    username: PropTypes.string,
    avatar: PropTypes.string,
    location: PropTypes.string,
    status: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string)
  })
}

const userQuery = graphql(USER_QUERY, {
  skip: ownProps => !ownProps.auth || !ownProps.auth.jwt,
  options: ({ auth }) => ({
    variables: { id: auth.id },
    fetchPolicy: 'cache-only'
  }),
  props: ({ data: { loading, user } }) => ({
    loading,
    user
  })
})

const updateUserMutation = graphql(UPDATE_USER_MUTATION, {
  props: ({ mutate }) => ({
    updateUser: user =>
      mutate({
        variables: { user }
      })
  })
})

const removeUserImageMutation = graphql(REMOVE_USER_IMAGE_MUTATION, {
  props: ({ mutate }) => ({
    removeUserImage: user =>
      mutate({
        variables: { user }
      })
  })
})

const mapStateToProps = ({ auth }) => ({
  auth
})

export default compose(
  connect(mapStateToProps),
  updateUserMutation,
  removeUserImageMutation,
  userQuery
)(Profile)
