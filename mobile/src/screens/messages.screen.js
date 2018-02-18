import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import randomColor from 'randomcolor'
import { graphql, compose } from 'react-apollo'
import update from 'immutability-helper'
import { Buffer } from 'buffer'
import _ from 'lodash'
import moment from 'moment'
import { connect } from 'react-redux'
import { Ionicons } from '@expo/vector-icons'

import { wsClient } from '../app'

import Message from '../components/message.component'
import MessageInput from '../components/message-input.component'
import { colors, metrics } from '../components/theme.component'

import { MATCH_QUERY } from '../graphql/match.query'
import CREATE_MESSAGE_MUTATION from '../graphql/create-message.mutation'
import { USER_QUERY } from '../graphql/user.query'
import MESSAGE_ADDED_SUBSCRIPTION from '../graphql/message-added.subscription'

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  container: {
    flex: 1,
    alignItems: 'stretch',
    backgroundColor: '#e5ddd5',
    flexDirection: 'column'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.chocolate,
    height: metrics.navbarHeight + metrics.statusBarHeight
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24
  },
  loading: {
    justifyContent: 'center'
  },
  titleWrapper: {
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  titleImage: {
    marginRight: 6,
    width: 32,
    height: 32,
    borderRadius: 16
  }
})

class Messages extends Component {
  constructor (props) {
    super(props)
    const usernameColors = {}
    if (props.match && props.match.users) {
      props.match.users.forEach(user => {
        usernameColors[user.username] = randomColor()
      })
    }

    this.state = {
      usernameColors
    }
  }

  componentWillReceiveProps (nextProps) {
    const usernameColors = {}
    // check for new messages
    if (nextProps.match) {
      if (
        !this.props.match &&
        this.props.navigation.state.params.icon !== nextProps.match.icon
      ) {
        this.refreshNavigation(nextProps)
      }

      if (
        nextProps.match.messages &&
        nextProps.match.messages.length &&
        nextProps.match.messages[0].id >= 0 &&
        (!nextProps.match.lastRead ||
          nextProps.match.lastRead.id !== nextProps.match.messages[0].id)
      ) {
        const { match } = nextProps
        nextProps.updateGroup({
          id: match.id,
          name: match.name,
          lastRead: match.messages[0].id
        })
      }

      if (nextProps.match.users) {
        // apply a color to each user
        nextProps.match.users.forEach(user => {
          usernameColors[user.username] =
            this.state.usernameColors[user.username] || randomColor()
        })
      }

      // we don't resubscribe on changed props
      // because it never happens in our app
      if (!this.subscription) {
        this.subscription = nextProps.subscribeToMore({
          document: MESSAGE_ADDED_SUBSCRIPTION,
          variables: {
            matchIds: [nextProps.navigation.state.params.matchId]
          },
          updateQuery: (previousResult, { subscriptionData }) => {
            const newMessage = subscriptionData.data.messageAdded

            return update(previousResult, {
              match: {
                messages: {
                  edges: {
                    $unshift: [
                      {
                        __typename: 'MessageEdge',
                        node: newMessage,
                        cursor: Buffer.from(newMessage.id.toString()).toString(
                          'base64'
                        )
                      }
                    ]
                  }
                }
              }
            })
          }
        })
      }

      if (!this.reconnected) {
        this.reconnected = wsClient.onReconnected(() => {
          this.props.refetch() // check for any data lost during disconnect
        }, this)
      }

      this.setState({
        usernameColors
      })
    } else if (this.reconnected) {
      // remove event subscription
      this.reconnected()
    }
  }

  onEndReached = () => {
    if (
      !this.state.loadingMoreEntries &&
      this.props.match.messages.pageInfo.hasNextPage
    ) {
      this.setState({
        loadingMoreEntries: true
      })
      this.props.loadMoreEntries().then(() => {
        this.setState({
          loadingMoreEntries: false
        })
      })
    }
  }

  send = text => {
    this.props
      .createMessage({
        matchId: this.props.navigation.state.params.matchId,
        text
      })
      .then(() => {
        this.flatList.scrollToIndex({ index: 0, animated: true })
      })
  }

  keyExtractor = item => item.node.id;

  refreshNavigation (props) {
    const { navigation, match } = props
    navigation.setParams({
      icon: match.icon
    })
  }

  renderItem = ({ item: edge }) => {
    const message = edge.node

    return (
      <Message
        color={this.state.usernameColors[message.from.username]}
        isCurrentUser={message.from.id === this.props.auth.id}
        message={message}
      />
    )
  };

  handleClose = () => this.props.navigation.goBack()

  render () {
    const { loading, match } = this.props

    // render loading placeholder while we fetch messages
    if (loading || !match) {
      return (
        <View style={[styles.loading, styles.container]}>
          <ActivityIndicator />
        </View>
      )
    }

    // render list of messages for match
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.button} />
          <View style={styles.button} />
          <TouchableOpacity style={styles.button} onPress={this.handleClose}>
            <Ionicons name='ios-close' size={30} color={colors.white} />
          </TouchableOpacity>
        </View>
        <KeyboardAvoidingView
          behavior='height'
          contentContainerStyle={styles.container}
          keyboardVerticalOffset={64}
          style={styles.container}
        >
          <FlatList
            ref={ref => {
              this.flatList = ref
            }}
            inverted
            data={match.messages.edges}
            keyExtractor={this.keyExtractor}
            renderItem={this.renderItem}
            ListEmptyComponent={<View />}
            onEndReached={this.onEndReached}
          />
          <MessageInput send={this.send} />
        </KeyboardAvoidingView>
      </View>
    )
  }
}

Messages.propTypes = {
  auth: PropTypes.shape({
    id: PropTypes.number,
    username: PropTypes.string
  }),
  createMessage: PropTypes.func,
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        matchId: PropTypes.number,
        icon: PropTypes.string
      })
    }),
    goBack: PropTypes.func
  }),
  match: PropTypes.shape({
    messages: PropTypes.shape({
      length: PropTypes.number,
      edges: PropTypes.arrayOf(
        PropTypes.shape({
          cursor: PropTypes.string,
          node: PropTypes.object
        })
      ),
      pageInfo: PropTypes.shape({
        hasNextPage: PropTypes.bool,
        hasPreviousPage: PropTypes.bool
      })
    }),
    icon: PropTypes.string,
    lastRead: PropTypes.shape({
      id: PropTypes.number
    }),
    users: PropTypes.array
  }),
  loading: PropTypes.bool,
  loadMoreEntries: PropTypes.func,
  refetch: PropTypes.func,
  subscribeToMore: PropTypes.func,
  updateGroup: PropTypes.func
}

const ITEMS_PER_PAGE = 10
const matchQuery = graphql(MATCH_QUERY, {
  skip: ownProps => !ownProps.auth || !ownProps.auth.jwt,
  options: ownProps => ({
    variables: {
      matchId: ownProps.navigation.state.params.matchId,
      messageConnection: {
        first: ITEMS_PER_PAGE
      }
    }
  }),
  props: ({
    data: { fetchMore, loading, match, refetch, subscribeToMore }
  }) => ({
    loading,
    match,
    refetch,
    subscribeToMore,
    loadMoreEntries () {
      return fetchMore({
        // query: ... (you can specify a different query.
        // GROUP_QUERY is used by default)
        variables: {
          // load more queries starting from the cursor of the last (oldest) message
          messageConnection: {
            first: ITEMS_PER_PAGE,
            after: match.messages.edges[match.messages.edges.length - 1].cursor
          }
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          // we will make an extra call to check if no more entries
          if (!fetchMoreResult) {
            return previousResult
          }
          // push results (older messages) to end of messages list
          return update(previousResult, {
            match: {
              messages: {
                edges: { $push: fetchMoreResult.match.messages.edges },
                pageInfo: { $set: fetchMoreResult.match.messages.pageInfo }
              }
            }
          })
        }
      })
    }
  })
})

const createMessageMutation = graphql(CREATE_MESSAGE_MUTATION, {
  props: ({ ownProps, mutate }) => ({
    createMessage: message =>
      mutate({
        variables: { message },
        optimisticResponse: {
          __typename: 'Mutation',
          createMessage: {
            __typename: 'Message',
            id: -1, // don't know id yet, but it doesn't matter
            text: message.text, // we know what the text will be
            createdAt: new Date().toISOString(), // the time is now!
            from: {
              __typename: 'User',
              id: ownProps.auth.id,
              username: ownProps.auth.username
            },
            to: {
              __typename: 'Match',
              id: message.matchId
            }
          }
        },
        update: (store, { data: { createMessage } }) => {
          // Read the data from our cache for this query.
          const matchData = store.readQuery({
            query: MATCH_QUERY,
            variables: {
              matchId: message.matchId,
              messageConnection: { first: ITEMS_PER_PAGE }
            }
          })

          // Add our message from the mutation to the end.
          matchData.match.messages.edges.unshift({
            __typename: 'MessageEdge',
            node: createMessage,
            cursor: Buffer.from(createMessage.id.toString()).toString('base64')
          })

          // Write our data back to the cache.
          store.writeQuery({
            query: MATCH_QUERY,
            variables: {
              matchId: message.matchId,
              messageConnection: { first: ITEMS_PER_PAGE }
            },
            data: matchData
          })

          const userData = store.readQuery({
            query: USER_QUERY,
            variables: {
              id: ownProps.auth.id
            }
          })

          // check whether the mutation is the latest message and update cache
          const updatedMatch = _.find(userData.user.matches, {
            id: message.matchId
          })
          if (
            !updatedMatch.messages.edges.length ||
            moment(updatedMatch.messages.edges[0].node.createdAt).isBefore(
              moment(message.createdAt)
            )
          ) {
            // update the latest message
            updatedMatch.messages.edges[0] = {
              __typename: 'MessageEdge',
              node: createMessage,
              cursor: Buffer.from(createMessage.id.toString()).toString(
                'base64'
              )
            }

            // Write our data back to the cache.
            store.writeQuery({
              query: USER_QUERY,
              variables: {
                id: ownProps.auth.id
              },
              data: userData
            })
          }
        }
      })
  })
})

const mapStateToProps = ({ auth }) => ({
  auth
})

export default compose(
  connect(mapStateToProps),
  matchQuery,
  createMessageMutation
)(Messages)
