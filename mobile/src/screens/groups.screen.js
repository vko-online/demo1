import PropTypes from 'prop-types'
import React, { Component } from 'react'
import {
  FlatList,
  ActivityIndicator,
  StyleSheet,
  View
} from 'react-native'
import { graphql, compose } from 'react-apollo'
import { partial } from 'lodash'
import { Ionicons } from '@expo/vector-icons'
import { connect } from 'react-redux'

import TagList from '../components/tag-list.component'
import HeaderSearch from '../components/header-search.component'
import GroupCard from '../components/group-card.component'

import { setFilterTags, setFilterSearch } from '../actions/filter.actions'

import { USER_QUERY } from '../graphql/user.query'
import { TAG_QUERY } from '../graphql/tag.query'
import { GROUP_ALL } from '../graphql/group.query'
import {
  GROUP_ADD_SAVED,
  GROUP_REMOVE_SAVED
} from '../graphql/group-saved.mutation'

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e9e9ef',
    marginTop: 20,
    flex: 1
  },
  loading: {
    justifyContent: 'center',
    flex: 1
  },
  header: {
    padding: 6,
    marginTop: 20,
    borderColor: '#eee',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center'
  },
  warning: {
    textAlign: 'center',
    padding: 12
  },
  groupsList: {
    marginTop: 10,
    marginHorizontal: 10
  },
  box: {
    marginTop: 10,
    marginHorizontal: 10,
    paddingTop: 10,
    height: 130,
    borderRadius: 5,
    backgroundColor: '#fff',
    shadowColor: '#f4eff5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2
  }
})

class Groups extends Component {
  static navigationOptions = {
    tabBarLabel: 'Explore',
    tabBarIcon: ({ tintColor }) => (
      <Ionicons color={tintColor} name='ios-search' size={30} />
    ),
    header: null
  };

  onRefresh = () => {
    this.props.refetch()
  };

  keyExtractor = item => item.id;

  goToMessages = group => {
    const { navigate } = this.props.navigation
    navigate('Messages', {
      groupId: group.id,
      title: group.name,
      icon: group.icon
    })
  };

  goToDetails = group => {
    const { navigate } = this.props.navigation
    navigate('GroupDetails', {
      groupId: group.id,
      title: group.name
    })
  };

  goToNewGroup = () => {
    const { navigate } = this.props.navigation
    navigate('NewGroup')
  };

  handleAddSaved = id => this.props.groupAddSaved(id);
  handleRemoveSaved = id => this.props.groupRemoveSaved(id);

  renderItem = ({ item }) => {
    const { user } = this.props
    const isFollowing = user.followingGroups.map(v => v.id).includes(item.id)
    return (
      <GroupCard
        isFollowing={isFollowing}
        group={item}
        onPress={partial(this.goToDetails, item)}
        onAddSaved={partial(this.handleAddSaved, item.id)}
        onRemoveSaved={partial(this.handleRemoveSaved, item.id)}
      />
    )
  };

  handleTagChange = tags => {
    this.props.dispatch(setFilterTags(tags))
    this.props.groupsRefetch()
  };

  handeSeachChange = text => {
    this.props.dispatch(setFilterSearch(text))
    this.props.groupsRefetch()
  };

  render () {
    const { user, groups, loading, networkStatus } = this.props
    let content
    // render loading placeholder while we fetch messages
    if (loading || !groups) {
      content = (
        <View style={[styles.loading, styles.container]}>
          <ActivityIndicator />
        </View>
      )
    } else {
      const availableGroups = groups.filter(g => !user.groups.map(v => v.id).includes(g.id))
      content = (
        <FlatList
          data={availableGroups}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderItem}
          style={styles.groupsList}
          onRefresh={this.onRefresh}
          refreshing={networkStatus === 4}
        />
      )
    }

    // if (!availableGroups.length) {
    //   return (
    //     <View style={styles.container}>
    //       <Text style={styles.warning}>{'No activities created yet.'}</Text>
    //     </View>
    //   )
    // }

    // render list of groups for user
    return (
      <View style={styles.container}>
        <View style={styles.box}>
          <HeaderSearch onChange={this.handeSeachChange} />
          <TagList data={this.props.tags} onChange={this.handleTagChange} />
        </View>
        {content}
      </View>
    )
  }
}
Groups.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func
  }),
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  networkStatus: PropTypes.number,
  refetch: PropTypes.func,
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    email: PropTypes.string.isRequired,
    groups: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
      })
    ),
    followingGroups: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
      })
    )
  }),
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      url: PropTypes.string
    })
  ),
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    })
  ),
  groupsRefetch: PropTypes.func,
  groupAddSaved: PropTypes.func,
  groupRemoveSaved: PropTypes.func
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

const groupsQuery = graphql(GROUP_ALL, {
  skip: ownProps => !ownProps.auth || !ownProps.auth.jwt,
  options: ownProps => ({
    variables: {
      tagIds: ownProps.filter.tags.map(v => v.id),
      text: ownProps.filter.text
    }
  }),
  props: ({ data: { groups, refetch } }) => ({
    groups,
    groupsRefetch: refetch
  })
})

const GroupAddSavedMutation = graphql(GROUP_ADD_SAVED, {
  props: ({ ownProps, mutate }) => ({
    groupAddSaved: id =>
      mutate({
        variables: { id },
        update: (store, { data: { groupAddSaved } }) => {
          // Read the data from our cache for this query.
          const data = store.readQuery({
            query: USER_QUERY,
            variables: { id: ownProps.auth.id }
          })

          data.user.followingGroups.push(groupAddSaved)

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

const GroupRemoveSavedMutation = graphql(GROUP_REMOVE_SAVED, {
  props: ({ ownProps, mutate }) => ({
    groupRemoveSaved: id =>
      mutate({
        variables: { id },
        update: (store, { data: { groupRemoveSaved } }) => {
          // Read the data from our cache for this query.
          const data = store.readQuery({
            query: USER_QUERY,
            variables: { id: ownProps.auth.id }
          })

          data.user.followingGroups = data.user.followingGroups.filter(
            g => groupRemoveSaved.id !== g.id
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

const tagQuery = graphql(TAG_QUERY, {
  skip: ownProps => !ownProps.auth || !ownProps.auth.jwt,
  props: ({ data: { tags } }) => ({
    tags
  })
})

const mapStateToProps = ({ auth, filter }) => ({
  auth,
  filter
})

export default compose(
  connect(mapStateToProps),
  groupsQuery,
  userQuery,
  tagQuery,
  GroupAddSavedMutation,
  GroupRemoveSavedMutation
)(Groups)
