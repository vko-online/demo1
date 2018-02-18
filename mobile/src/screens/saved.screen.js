import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import { graphql, compose } from 'react-apollo'
import { partial } from 'lodash'
import { Octicons } from '@expo/vector-icons'
import { DangerZone } from 'expo'
import { connect } from 'react-redux'

import GroupCard from '../components/group-card.component'

import { USER_QUERY } from '../graphql/user.query'
import { GROUP_REMOVE_SAVED } from '../graphql/group-saved.mutation'

import { Heading2 } from '../components/text.component'
const animation = require('../assets/animations/LottieLogo1.json')
const { Lottie } = DangerZone

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
  emptySection: {
    alignItems: 'center'
  },
  emptySection__animation: {
    width: 400,
    height: 200
  },
  heading: {
    textAlign: 'center'
  },
  groupsList: {
    marginTop: 10,
    marginHorizontal: 10
  }
})

class Saved extends Component {
  static navigationOptions = {
    tabBarLabel: 'Saved',
    tabBarIcon: ({ tintColor }) => (
      <Octicons color={tintColor} name='inbox' size={30} />
    ),
    header: null
  };

  onRefresh = () => {
    this.props.refetch()
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (this.anim) {
      this.anim.play()
    }
  }

  goToMessages = group => {
    const { navigate } = this.props.navigation
    navigate('Messages', {
      groupId: group.id,
      title: group.name,
      icon: group.icon
    })
  };

  handleRemoveSaved = id => {
    this.props.groupRemoveSaved(id)
  };

  renderItem = ({ item }) => (
    <GroupCard
      group={item}
      onPress={this.goToMessages}
      onAddSaved={partial(this.handleRemoveSaved, item.id)}
    />
  );

  keyExtractor = item => item.id;

  renderEmpty = () => {
    return (
      <View style={[styles.container, styles.emptySection]}>
        <Lottie
          ref={r => {
            this.anim = r
          }}
          style={styles.emptySection__animation}
          source={animation}
        />
        <Heading2 style={styles.heading}>
          No saved events yet, {'\n'} add them from Explore tab
        </Heading2>
      </View>
    )
  };
  render () {
    const { loading, user, networkStatus } = this.props

    // render loading placeholder while we fetch messages
    if (loading || !user) {
      return (
        <View style={[styles.loading, styles.container]}>
          <ActivityIndicator />
        </View>
      )
    }

    const availableFollowingGroups = this.props.user.followingGroups.filter(
      g => !this.props.user.groups.map(v => v.id).includes(g.id)
    )

    if (!availableFollowingGroups.length) {
      return this.renderEmpty()
    }

    // render list of groups for user
    return (
      <View style={styles.container}>
        <FlatList
          data={availableFollowingGroups}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderItem}
          style={styles.groupsList}
          onRefresh={this.onRefresh}
          refreshing={networkStatus === 4}
        />
      </View>
    )
  }
}

Saved.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func
  }),
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

const GroupRemoveSavedMutation = graphql(GROUP_REMOVE_SAVED, {
  props: ({ mutate }) => ({
    groupRemoveSaved: id =>
      mutate({
        variables: { id }
      })
  })
})

const mapStateToProps = ({ auth }) => ({
  auth
})

export default compose(
  connect(mapStateToProps),
  userQuery,
  GroupRemoveSavedMutation
)(Saved)
