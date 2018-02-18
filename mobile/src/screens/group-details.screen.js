// TODO: update group functionality
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  ActivityIndicator,
  Button,
  Image,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View
} from 'react-native'
import { graphql, compose } from 'react-apollo'
import { NavigationActions } from 'react-navigation'
import { connect } from 'react-redux'
import { ImagePicker, MapView, LinearGradient, DangerZone } from 'expo'
import { Ionicons } from '@expo/vector-icons'
import Spinner from 'react-native-loading-spinner-overlay'
import { ReactNativeFile } from 'apollo-upload-client'
import openMap from 'react-native-open-maps'
import _ from 'lodash'

import { colors, darken, mapStyle, formatDate, lighten } from '../components/theme.component'
import { Heading1, Heading2, Text, Paragraph } from '../components/text.component'
import { SectionHeader, SectionItem } from '../components/section.component'
import FaqList from '../components/faq-list.component'
import ReviewEditor from '../components/review-editor.component'

import { GROUP_QUERY } from '../graphql/group.query'
import { USER_QUERY } from '../graphql/user.query'
import DELETE_GROUP_MUTATION from '../graphql/delete-group.mutation'
import LEAVE_GROUP_MUTATION from '../graphql/leave-group.mutation'
import UPDATE_GROUP_MUTATION from '../graphql/update-group.mutation'
import CREATE_REVIEW_MUTATION from '../graphql/create-review.mutation'

const { Lottie } = DangerZone
const ratingAnimation = require('../assets/animations/star.json')

const resetAction = NavigationActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: 'Main' })]
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  groupImageContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 6,
    alignItems: 'center'
  },
  groupName: {
    color: 'black',
    height: 32
  },
  groupNameBorder: {
    borderBottomWidth: 1,
    borderColor: '#dbdbdb',
    borderTopWidth: 1,
    flex: 1,
    paddingVertical: 8
  },
  groupImage: {
    width: 54,
    height: 54,
    borderRadius: 27
  },
  participants: {
    borderBottomWidth: 1,
    borderColor: '#dbdbdb',
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: '#dbdbdb',
    color: '#777'
  },
  user: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#dbdbdb',
    flexDirection: 'row',
    padding: 10
  },
  username: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  header: {
    paddingHorizontal: 17,
    marginVertical: 20
  },
  groupIcon: {
    width: '100%',
    height: 200
  },
  map: {
    flex: 1,
    height: 150
  },
  messagesButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  messagesButton__text: {
    color: colors.actionText,
    fontSize: 15
  },
  groupHeader: {
    paddingVertical: 10,
    paddingLeft: 17,
    paddingRight: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  groupAdmin: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  groupAdmin__info: {
    paddingLeft: 10,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-start'
  },
  groupAdmin__image: {
    backgroundColor: 'red',
    width: 50,
    height: 50,
    borderRadius: 25
  },
  groupAdmin__host: {
    lineHeight: 16,
    color: lighten(colors.darkText, 20)
  },
  emptySection: {
    paddingVertical: 20,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptySection__text: {
    paddingHorizontal: 17,
    color: colors.lightText,
    fontSize: 16
  },
  emptySection__animWrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    marginBottom: 10
  },
  emptySection__animation: {
    width: 40,
    height: 40
  },
  groupReview: {
    flexDirection: 'column',
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lightText,
    padding: 5,
    margin: 10,
    maxWidth: 110
  },
  groupReview__author: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  groupReview__authorAvatar: {
    width: 20,
    height: 20,
    marginRight: 2
  },
  groupReview__authorName: {
    fontFamily: 'markweb',
    color: colors.lightText,
    width: 80,
    fontSize: 14
  },
  groupReview__stars: {
    flexDirection: 'row'
  },
  groupReview__text: {
    flex: 1,
    fontFamily: 'markweb',
    color: colors.darkText
  }
})

class GroupDetails extends Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation
    const isReady = state.params && state.params.mode === 'ready'
    return {
      title: `${navigation.state.params.title}`,
      headerLeft: (
        <TouchableOpacity style={{margin: 10, padding: 10}} onPress={() => navigation.goBack()}>
          <Ionicons name='ios-close' size={30} color={colors.darkText} />
        </TouchableOpacity>
      ),
      headerRight: isReady
        ? <Button title='Done' onPress={state.params.updateGroup} />
        : undefined
    }
  };

  placeholders = [
    require('../assets/images/fractal_exterior.jpg'),
    require('../assets/images/fractal_exterior2.jpg'),
    require('../assets/images/fractal_interior2.jpg')
  ]

  state = {}

  componentWillUpdate (nextProps, nextState) {
    if (
      !!this.state.name !== !!nextState.name ||
      !!this.state.icon !== !!nextState.icon
    ) {
      this.refreshNavigation(nextProps, nextState)
    }
  }

  getIcon = async () => {
    const self = this
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      mediaTypes: ImagePicker.MediaTypeOptions.Images
    })
    if (!result.cancelled) {
      const icon = new ReactNativeFile({
        name: 'avatar',
        type: result.type,
        path: result.uri,
        uri: result.uri
      })
      self.setState({ icon })
    }
  }

  onChangeText = (name) => {
    this.setState({ name })
  }

  refreshNavigation = (props, state) => {
    const { navigation, group } = props
    navigation.setParams({
      mode: (state.name && group.name !== state.name) || state.icon
        ? 'ready'
        : undefined,
      updateGroup: this.updateGroup,
      cancel: this.cancel
    })
  }

  cancel = () => {
    this.setState({
      icon: null,
      name: null,
      updating: false
    })
  }

  deleteGroup = () => {
    this.props
      .deleteGroup(this.props.navigation.state.params.id)
      .then(() => {
        this.props.navigation.dispatch(resetAction)
      })
      .catch(e => {
        console.log(e) // eslint-disable-line no-console
      })
  }

  leaveGroup = () => {
    this.props
      .leaveGroup({
        id: this.props.navigation.state.params.id
      })
      .then(() => {
        this.props.navigation.dispatch(resetAction)
      })
      .catch(e => {
        console.log(e) // eslint-disable-line no-console
      })
  }

  updateGroup = () => {
    const { id } = this.props.group
    const { name, icon } = this.state
    this.setState({ updating: true })
    this.props.updateGroup({ id, name, icon }).then(this.cancel)
  }

  handleMessagesPress = () => {
    this.props.navigation.navigate('Messages', {
      groupId: this.props.group.id,
      title: this.props.group.name,
      icon: this.props.group.icon
    })
  }

  handleNewReviewPress = review => {
    this.props.addGroupReview(review)
  }

  handleOpenMapPress = () => {
    const { group } = this.props
    openMap({ latitude: group.location_lat, longitude: group.location_lng })
  }

  keyExtractor = item => item.id;

  renderItem = ({ item: user }) => (
    <View style={styles.user}>
      <Image
        style={styles.avatar}
        source={require('../assets/images/robot-prod.png')}
        cache={'force-cache'}
      />
      <Text style={styles.username}>{user.username}</Text>
    </View>
  );

  renderHeader = () => {
    const { group } = this.props

    return (
      <View>
        <Image
          resizeMode='center'
          source={this.placeholders[Math.floor(Math.random() * this.placeholders.length)]}
          style={styles.groupIcon}
        />
        <LinearGradient colors={['#F4F6F7', '#EBEEF1']} style={styles.groupHeader}>
          <View style={styles.groupAdmin}>
            <Image style={styles.groupAdmin__image} source={require('../assets/images/robot-prod.png')} />
            <View style={styles.groupAdmin__info}>
              <Text style={styles.groupAdmin__host}>Your host</Text>
              <Heading2>{group.admin.username}</Heading2>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.6} style={styles.messagesButton} onPress={this.handleMessagesPress}>
            <Text style={styles.messagesButton__text}>Messages</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    )
  }

  renderBody = () => {
    const { group } = this.props
    const canRenderPricePerPerson = group.price_per_person > 0
    const canRenderPricePerActivity = group.price_per_activity > 0

    return (
      <View>
        <View style={styles.header}>
          <Heading1>{group.name}</Heading1>
          <Paragraph>{group.description}</Paragraph>
        </View>
        <View style={styles.row}>
          <SectionHeader title='Event date' />
          <SectionItem title={formatDate(group.date)} />
        </View>
        <View style={styles.row}>
          <SectionHeader title='Location'>
            <Button title='Open in Maps' onPress={this.handleOpenMapPress} />
          </SectionHeader>
          <MapView
            style={styles.map}
            provider={MapView.PROVIDER_GOOGLE}
            customMapStyle={mapStyle}
            region={{
              latitude: group.location_lat,
              longitude: group.location_lng,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.08
            }}
            center={{
              latitude: group.location_lat,
              longitude: group.location_lng,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.08
            }}
          />
        </View>
        <View style={styles.row}>
          <SectionHeader title='Reviews'>
            {/* <Button title='Add review' onPress={this.handleNewReviewPress} /> */}
            <ReviewEditor group={group} onSubmit={this.handleNewReviewPress} />
          </SectionHeader>
          {this.renderReviews()}
        </View>
        <View style={styles.row}>
          <SectionHeader title='FAQ' />
          {this.renderFaq()}
        </View>
        {
          canRenderPricePerPerson && (
            <View style={styles.row}>
              <SectionHeader title='Price per person' />
              <SectionItem title={group.price_per_person} />
            </View>
          )
        }
        {
          canRenderPricePerActivity && (
            <View style={styles.row}>
              <SectionHeader title='Price per activity' />
              <SectionItem title={group.price_per_activity} />
            </View>
          )
        }
        <View style={styles.row}>
          <SectionHeader title='Attendees required' />
          <SectionItem title={`${group.min_person_count} - ${group.max_person_count} people`} />
        </View>
        <View style={styles.row}>
          <SectionHeader title='Tags' />
          <SectionItem title={group.tags.map(v => v.name).join(', ')} />
        </View>
        <View style={styles.row}>
          <SectionHeader title={`Particiants ${group.users.length}`}>
            <Button title='Invite' onPress={() => {}} />
          </SectionHeader>
          <SectionItem>
            <FlatList
              data={group.users}
              keyExtractor={this.keyExtractor}
              renderItem={this.renderItem}
            />
          </SectionItem>
        </View>
      </View>
    )
  }

  setAnimationRef = (ref) => {
    this.animRef = ref
    if (ref) {
      ref.play()
    }
  }

  componentDidMount = () => {
    if (this.animRef) {
      this.animRef.play()
    }
  }

  renderGroupReviewItem = ({ item }) => {
    return (
      <View style={styles.groupReview}>
        <View style={styles.groupReview__stars}>
          {
            _.times(item.points).map(v => <Ionicons key={v} size={20} color={darken('#ffff00', 10)} name='ios-star' />)
          }
        </View>
        <Text numberOfLines={5} style={styles.groupReview__text}>{item.text}</Text>
        <View style={styles.groupReview__author}>
          <Image source={require('../assets/images/robot-prod.png')} style={styles.groupReview__authorAvatar} />
          <Text numberOfLines={1} style={styles.groupReview__authorName}>{item.user.username}</Text>
        </View>
      </View>
    )
  }

  renderReviews = () => {
    const { group } = this.props
    if (group.reviews && group.reviews.length) {
      return (
        <SectionItem>
          <FlatList
            data={group.reviews}
            keyExtractor={v => v.id}
            horizontal
            style={styles.groupReviewList}
            renderItem={this.renderGroupReviewItem}
          />
        </SectionItem>
      )
    }
    return (
      <SectionItem empty>
        <View style={styles.emptySection}>
          <View style={styles.emptySection__animWrapper}>
            <Lottie
              ref={this.setAnimationRef}
              speed={0.7}
              style={styles.emptySection__animation}
              source={ratingAnimation}
            />
          </View>
          <Text style={styles.emptySection__text}>No reviews yet</Text>
        </View>
      </SectionItem>
    )
  }

  renderFaq = () => {
    const { group } = this.props
    if (group.faqs && group.faqs.length) {
      return <SectionItem><FaqList faqs={group.faqs} /></SectionItem>
    }
    return <SectionItem empty title='Empty' />
  }

  render () {
    const { group, loading } = this.props

    // render loading placeholder while we fetch messages
    if (!group || loading) {
      return (
        <View style={[styles.loading, styles.container]}>
          <ActivityIndicator />
        </View>
      )
    }

    return (
      <ScrollView style={styles.container}>
        <Spinner visible={this.state.updating} />
        {this.renderHeader()}
        {this.renderBody()}
      </ScrollView>
    )
  }
}

GroupDetails.propTypes = {
  loading: PropTypes.bool,
  group: PropTypes.shape({
    id: PropTypes.number,
    icon: PropTypes.string,
    name: PropTypes.string,
    users: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        username: PropTypes.string
      })
    )
  }),
  navigation: PropTypes.shape({
    dispatch: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        title: PropTypes.string,
        id: PropTypes.number
      })
    }),
    navigate: PropTypes.func
  }),
  deleteGroup: PropTypes.func.isRequired,
  leaveGroup: PropTypes.func.isRequired,
  updateGroup: PropTypes.func,
  addGroupReview: PropTypes.func
}

const groupQuery = graphql(GROUP_QUERY, {
  skip: ownProps => !ownProps.auth || !ownProps.auth.jwt,
  options: ownProps => ({
    variables: { groupId: ownProps.navigation.state.params.groupId }
  }),
  props: ({ data: { loading, group } }) => ({
    loading,
    group
  })
})

const deleteGroupMutation = graphql(DELETE_GROUP_MUTATION, {
  props: ({ ownProps, mutate }) => ({
    deleteGroup: id =>
      mutate({
        variables: { id },
        update: (store, { data: { deleteGroup } }) => {
          // Read the data from our cache for this query.
          const data = store.readQuery({
            query: USER_QUERY,
            variables: { id: ownProps.auth.id }
          })

          // Add our message from the mutation to the end.
          data.user.groups = data.user.groups.filter(
            g => deleteGroup.id !== g.id
          )

          // Write our data back to the cache.
          store.writeQuery({
            query: USER_QUERY,
            variables: { id: ownProps.auth.id },
            data
          })
        }
      })
  })
})

const leaveGroupMutation = graphql(LEAVE_GROUP_MUTATION, {
  props: ({ ownProps, mutate }) => ({
    leaveGroup: ({ id }) =>
      mutate({
        variables: { id },
        update: (store, { data: { leaveGroup } }) => {
          // Read the data from our cache for this query.
          const data = store.readQuery({
            query: USER_QUERY,
            variables: { id: ownProps.auth.id }
          })

          // Add our message from the mutation to the end.
          data.user.groups = data.user.groups.filter(
            g => leaveGroup.id !== g.id
          )

          // Write our data back to the cache.
          store.writeQuery({
            query: USER_QUERY,
            variables: { id: ownProps.auth.id },
            data
          })
        }
      })
  })
})

const createReviewMutation = graphql(CREATE_REVIEW_MUTATION, {
  props: ({ ownProps, mutate }) => ({
    addGroupReview: (review) =>
      mutate({
        variables: { review },
        update: (store, { data: { addGroupReview } }) => {
          const groupData = store.readQuery({
            query: GROUP_QUERY,
            variables: {
              groupId: review.groupId
            }
          })

          groupData.group.reviews = addGroupReview.reviews

          store.writeQuery({
            query: GROUP_QUERY,
            variables: {
              groupId: review.groupId
            },
            data: groupData
          })
        }
      })
  })
})

const updateGroupMutation = graphql(UPDATE_GROUP_MUTATION, {
  props: ({ mutate }) => ({
    updateGroup: group =>
      mutate({
        variables: { group }
      })
  })
})

const mapStateToProps = ({ auth }) => ({
  auth
})

export default compose(
  connect(mapStateToProps),
  groupQuery,
  deleteGroupMutation,
  leaveGroupMutation,
  updateGroupMutation,
  createReviewMutation
)(GroupDetails)
