import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native'
import { graphql, compose } from 'react-apollo'
import { partial } from 'lodash'
import { Octicons } from '@expo/vector-icons'
import { DangerZone } from 'expo'
import { connect } from 'react-redux'

import GroupCard from '../components/group-card.component'
import { Text, Heading2 } from '../components/text.component'
import { colors } from '../components/theme.component'

import { USER_QUERY } from '../graphql/user.query'
import { GROUP_REMOVE_SAVED } from '../graphql/group-saved.mutation'

const animation = require('../assets/animations/LottieLogo1.json')
const { Lottie } = DangerZone

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e9e9ef',
    marginTop: 20,
    flex: 1
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10
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
  topHeading: {
    textAlign: 'left',
    color: '#7F91A7'
  },
  groupsList: {
    marginTop: 10,
    marginHorizontal: 10
  },
  createButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  createButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  createButton__text: {
    color: colors.actionText,
    fontSize: 15
  }
})

class My extends Component {
  static navigationOptions = {
    tabBarLabel: 'My',
    tabBarIcon: ({ tintColor }) => (
      <Octicons color={tintColor} name='inbox' size={30} />
    ),
    header: null
  };

  onRefresh = () => {
    this.props.refetch()
  }

  goToGroupDetails = (group) => {
    const { navigate } = this.props.navigation
    navigate('GroupDetails', {
      groupId: group.id,
      title: group.name,
      icon: group.icon
    })
  }

  handleRemoveSaved = (id) => {
    this.props.groupRemoveSaved(id)
  }

  renderItem = ({ item }) => (
    <GroupCard group={item} onPress={this.goToGroupDetails} onAddSaved={partial(this.handleRemoveSaved, item.id)} />
  );

  keyExtractor = item => item.id;

  componentDidMount () {
    if (this.anim) {
      this.anim.play()
    }
  }

  handleCreateButtonPress = () => {
    const { navigate } = this.props.navigation
    navigate('NewGroup')
  }

  renderCreateButton = () => {
    return (
      <View style={styles.createButtonContainer}>
        <TouchableOpacity activeOpacity={0.6} style={styles.createButton} onPress={this.handleCreateButtonPress}>
          <Text style={styles.createButton__text}>Create new event</Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderEmpty = () => {
    return (
      <View style={styles.emptySection}>
        <Lottie
          ref={r => (this.anim = r)}
          style={styles.emptySection__animation}
          source={animation}
        />
        <Heading2 style={styles.heading}>No events yet, {'\n'} create new or join other events</Heading2>
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

    if (user.groups && !user.groups.length) {
      return this.renderEmpty()
    }

    // render list of groups for user
    return (
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <Heading2 style={styles.topHeading}>Events you participating</Heading2>
          {this.renderCreateButton()}
        </View>
        <FlatList
          data={user.groups}
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

My.propTypes = {
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

export default compose(connect(mapStateToProps), userQuery, GroupRemoveSavedMutation)(My)
