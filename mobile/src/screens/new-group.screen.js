import { _ } from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  ActivityIndicator,
  Button,
  Image,
  StyleSheet,
  TextInput,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Switch,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import { graphql, compose } from 'react-apollo'
import AlphabetListView from 'react-native-alphabetlistview'
import update from 'immutability-helper'
import { ImagePicker } from 'expo'
import { FontAwesome, Ionicons } from '@expo/vector-icons'
import { connect } from 'react-redux'
import {
  IndicatorViewPager,
  PagerDotIndicator,
  PagerTitleIndicator
} from 'rn-viewpager'

import SelectedUserList from '../components/selected-user-list.component'
import { Text, Heading1, Heading2 } from '../components/text.component'
import DatePicker from '../components/date-picker.component'
import TagPicker from '../components/tag-picker.component'
import LocationPicker from '../components/location-picker.component'
import { colors, formatDate } from '../components/theme.component'

import USER_QUERY from '../graphql/user.query'
import { TAG_QUERY } from '../graphql/tag.query'

const WIDTH = Dimensions.get('window').width

// eslint-disable-next-line
const sortObject = o =>
  Object.keys(o).sort().reduce((r, k) => ((r[k] = o[k]), r), {})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  page: {
    flex: 1,
    marginHorizontal: 10
  },
  cellContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  cellImage: {
    width: 32,
    height: 32,
    borderRadius: 16
  },
  cellLabel: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  selected: {
    flexDirection: 'row'
  },
  loading: {
    justifyContent: 'center',
    flex: 1
  },
  navIcon: {
    color: 'blue',
    fontSize: 18,
    paddingTop: 2
  },
  checkButtonContainer: {
    paddingRight: 12,
    paddingVertical: 6
  },
  checkButton: {
    borderWidth: 1,
    borderColor: '#dbdbdb',
    padding: 4,
    height: 24,
    width: 24
  },
  checkButtonIcon: {
    marginRight: -4 // default is 12
  },
  row1: {
    marginTop: 10,
    paddingVertical: 30,
    flexDirection: 'column',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  row2: {
    paddingVertical: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  rowButton: {
    flexDirection: 'row',
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  groupDescriptionInput: {
    fontSize: 15,
    lineHeight: 15,
    height: 100,
    fontFamily: 'markweb-medium'
  },
  groupNameInput: {
    fontSize: 30,
    lineHeight: 30,
    fontFamily: 'markweb-medium'
  },
  groupUsersHeading: {
    marginVertical: 30
  },
  groupValue: {
    fontSize: 16,
    fontFamily: 'Arial',
    color: colors.actionText
  },
  groupImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  rowRight: {
    flexShrink: 0,
    flexGrow: 0,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  rowLeft: {
    flexGrow: 0,
    flexShrink: 1
  },
  rowContainer: {
    flex: 1
  },
  imageOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    paddingVertical: 10,
    paddingRight: 10
  }
})

class ViewPagerPage extends Component {
  static propTypes = {
    pages: PropTypes.arrayOf(PropTypes.element),
    reference: PropTypes.func
  }
  render () {
    return (
      <KeyboardAvoidingView style={styles.container}>
        <IndicatorViewPager
          style={styles.container}
          scrollEnabled={false}
          horizontalScroll={false}
          ref={this.props.reference}
          indicator={this._renderDotIndicator()}
        >
          {this.props.pages.map((page, idx) => <View key={idx}>{page}</View>)}
        </IndicatorViewPager>
      </KeyboardAvoidingView>
    )
  }

  _renderDotIndicator () {
    return <PagerDotIndicator pageCount={3} selectedDotStyle={{backgroundColor: '#007AFF'}} />;
  }

  _renderTitleIndicator () {
    return (
      <PagerTitleIndicator
        titles={['Basic info', 'Description', 'Invitations']}
        itemStyle={{width: WIDTH / 3}}
        itemTextStyle={{width: WIDTH / 3, textAlign: 'center'}}
        selectedItemStyle={{width: WIDTH / 3}}
        selectedItemTextStyle={{width: WIDTH / 3, textAlign: 'center'}}
      />
    )
  }
}

const SectionHeader = ({ title }) => {
  // inline styles used for brevity, use a stylesheet when possible
  const textStyle = {
    textAlign: 'left',
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 20
  }

  const viewStyle = {
    backgroundColor: '#ccc'
  }
  return (
    <View style={viewStyle}>
      <Text style={textStyle}>{title}</Text>
    </View>
  )
}
SectionHeader.propTypes = {
  title: PropTypes.string
}

const SectionItem = ({ title }) => (
  <Text style={{ color: 'blue' }}>{title}</Text>
)
SectionItem.propTypes = {
  title: PropTypes.string
}

class Cell extends Component {
  state = {
    isSelected: this.props.isSelected(this.props.item)
  };

  componentWillReceiveProps (nextProps) {
    this.setState({
      isSelected: nextProps.isSelected(nextProps.item)
    })
  }

  toggle = () => {
    this.props.toggle(this.props.item)
  };

  render () {
    return (
      <View style={styles.cellContainer}>
        <Image
          style={styles.cellImage}
          source={{
            uri: 'https://sheldons.files.wordpress.com/2017/06/reactlogo.png?w=254&h=254'
          }}
        />
        <Text style={styles.cellLabel}>{this.props.item.username}</Text>
        <View style={styles.checkButtonContainer}>
          <FontAwesome.Button
            backgroundColor={this.state.isSelected ? 'blue' : 'white'}
            borderRadius={12}
            color={'white'}
            iconStyle={styles.checkButtonIcon}
            name={'check'}
            onPress={this.toggle}
            size={16}
            style={styles.checkButton}
          />
        </View>
      </View>
    )
  }
}
Cell.propTypes = {
  isSelected: PropTypes.func,
  item: PropTypes.shape({
    username: PropTypes.string.isRequired
  }).isRequired,
  toggle: PropTypes.func.isRequired
}

class NewGroup extends Component {
  static navigationOptions = ({ navigation }) => {
    const { state } = navigation
    const isReady = state.params && state.params.mode === 'ready'
    return {
      title: 'New Activity',
      headerLeft: (
        <TouchableOpacity style={{margin: 10, padding: 10}} onPress={() => navigation.goBack()}>
          <Ionicons name='ios-close' size={30} color={colors.darkText} />
        </TouchableOpacity>
      ),
      headerRight: isReady
        ? <Button title='Submit' onPress={state.params.finalizeGroup} />
        : undefined
    }
  };

  defaultState = {
    name: '',
    description: '',
    icon: null,
    date: null,
    tags: [],
    location: null,
    is_public: false,
    price_per_person: 0,
    price_per_activity: 0,
    min_person_count: 0,
    max_person_count: 0
  }

  constructor (props) {
    super(props)

    let selected = []
    if (this.props.navigation.state.params) {
      selected = this.props.navigation.state.params.selected
    }

    this.state = {
      selected: selected || [],
      friends: props.user
        ? _.groupBy(props.user.friends, friend =>
          friend.username.charAt(0).toUpperCase()
        )
        : [],
      name: this.defaultState.name,
      description: this.defaultState.description,
      icon: this.defaultState.icon,
      date: this.defaultState.date,
      tags: this.defaultState.tags,
      location: this.defaultState.location,
      is_public: this.defaultState.is_public,
      price_per_person: this.defaultState.price_per_person,
      price_per_activity: this.defaultState.price_per_activity,
      min_person_count: this.defaultState.min_person_count,
      max_person_count: this.defaultState.max_person_count
    }
  }

  componentDidMount () {
    this.refreshNavigation(this.state.selected)
  }

  componentWillReceiveProps (nextProps) {
    const state = {}
    if (
      nextProps.user &&
      nextProps.user.friends &&
      nextProps.user !== this.props.user
    ) {
      state.friends = sortObject(
        _.groupBy(nextProps.user.friends, friend =>
          friend.username.charAt(0).toUpperCase()
        )
      )
    }

    if (nextProps.selected) {
      Object.assign(state, {
        selected: nextProps.selected
      })
    }

    this.setState(state)
  }

  componentWillUpdate (nextProps, nextState) {
    if (!!this.state.selected.length !== !!nextState.selected.length) {
      this.refreshNavigation(nextState.selected)
    }
  }

  refreshNavigation (selected) {
    const { navigation } = this.props
    navigation.setParams({
      mode: selected && selected.length ? 'ready' : undefined,
      finalizeGroup: this.finalizeGroup
    })
  }

  finalizeGroup = () => {
    const { navigate } = this.props.navigation
    navigate('FinalizeGroup', {
      selected: this.state.selected,
      friendCount: this.props.user.friends.length,
      userId: this.props.user.id
    })
  };

  isSelected = user => {
    return ~this.state.selected.indexOf(user)
  };

  toggle = user => {
    const index = this.state.selected.indexOf(user)
    if (~index) {
      const selected = update(this.state.selected, { $splice: [[index, 1]] })

      return this.setState({
        selected
      })
    }

    const selected = [...this.state.selected, user]

    return this.setState({
      selected
    })
  };

  handleNameChange = name => this.setState({ name });
  handleDateSelect = date => this.setState({ date });
  handleTagsSelect = tags => this.setState({ tags });
  handleLocationSelect = location => this.setState({ location });
  handleIsPublicChange = is_public => this.setState({ is_public });
  handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3]
    })

    if (!result.cancelled) {
      this.setState({ icon: result.uri })
    }
  };

  canGoNext = (props) => {
    return props.some(v => _.isEqual(this.state[v], this.defaultState[v]))
  }

  render () {
    const { user, loading } = this.props

    // render loading placeholder while we fetch messages
    if (loading || !user) {
      return (
        <View style={[styles.loading, styles.container]}>
          <ActivityIndicator />
        </View>
      )
    }

    const page1 = (
      <View style={styles.page}>
        <ScrollView style={styles.rowContainer}>
          <View style={styles.row1}>
            <Heading2>Give it a good name</Heading2>
            <TextInput
              placeholder='My Awesome event'
              style={styles.groupNameInput}
              value={this.state.name}
              onChangeText={this.handleNameChange}
            />
          </View>

          <View style={styles.row2}>
            {this.state.icon && <Image source={{uri: this.state.icon}} style={styles.groupImage} />}
            <View style={[styles.rowLeft, styles.imageOverlay]}>
              <Heading2>Event image</Heading2>
              <Text>Full image will be shown</Text>
            </View>
            <Button title={this.state.icon ? 'Change' : 'Select'} onPress={this.handlePickImage} />
          </View>

          <View style={styles.row2}>
            <View style={styles.rowLeft}>
              <Heading2>Event date</Heading2>
              <Text>The date event will be held</Text>
            </View>
            <View style={styles.rowRight}>
              <DatePicker
                text={this.state.date ? formatDate(this.state.date) : 'Change'}
                selectedValue={this.state.date}
                onSelect={this.handleDateSelect}
              />
            </View>
          </View>

          <View style={styles.row2}>
            <View style={styles.rowLeft}>
              <Heading2>Categories</Heading2>
              <Text>Select categories that suite best</Text>
            </View>
            <TagPicker
              text={this.state.tags.length ? this.state.tags.map(v => v.name).join(' ') : 'Change'}
              selectedValue={this.state.tags}
              tags={this.props.tags}
              onSelect={this.handleTagsSelect}
            />
          </View>

          <View style={styles.row2}>
            <View style={styles.rowLeft}>
              <Heading2>Set Event place</Heading2>
              <Text>Exact geolocation of event</Text>
            </View>
            <View style={styles.rowRight}>
              <LocationPicker
                text={
                  (this.state.location && this.state.location.location_text) ||
                    'Set location'
                }
                selectedValue={this.state.location}
                onSelect={this.handleLocationSelect}
              />
            </View>
          </View>
        </ScrollView>
        <View style={styles.rowButton}>
          <Button title='Next' disabled={this.canGoNext(['name', 'tags', 'location', 'date'])} onPress={() => this.viewPager.setPage(1)} />
        </View>
      </View>
    )

    const page2 = (
      <View style={styles.page}>
        <ScrollView style={styles.rowContainer}>
          <View style={styles.row1}>
            <Heading2>Description</Heading2>
            <TextInput
              multiline
              placeholder='Tell more about this event'
              style={styles.groupDescriptionInput}
            />
          </View>
          <View style={styles.row2}>
            <View style={styles.rowLeft}>
              <Heading2>Is this a public event?</Heading2>
              <Text>Public events can be attended by anyone</Text>
            </View>
            <Switch
              style={styles.rowRight}
              onValueChange={this.handleIsPublicChange}
              value={this.state.is_public}
            />
          </View>
          <View style={styles.row2}>
            <View style={styles.rowLeft}>
              <Heading2>Attendee limitation</Heading2>
              <Text>Does this event require exact amount of participants?</Text>
            </View>
            <Switch style={styles.rowRight} />
          </View>
          <View style={styles.row2}>
            <View style={styles.rowLeft}>
              <Heading2>Financial aspect</Heading2>
              <Text>Do participants need to have money for this event?</Text>
            </View>
            <Switch style={styles.rowRight} />
          </View>
        </ScrollView>
        <View style={styles.rowButton}>
          <Button title='Back' onPress={() => this.viewPager.setPage(0)} />
          <Button title='Next' onPress={() => this.viewPager.setPage(2)} />
        </View>
      </View>
    )

    const page3 = (
      <View style={styles.page}>
        <Heading1 style={styles.groupUsersHeading}>Event participants</Heading1>
        {this.state.selected.length
          ? <View style={styles.selected}>
            <SelectedUserList
              data={this.state.selected}
              remove={this.toggle}
            />
          </View>
          : undefined}
        {_.keys(this.state.friends).length
          ? <AlphabetListView
            style={{ flex: 1 }}
            data={this.state.friends}
            cell={Cell}
            cellHeight={30}
            cellProps={{
              isSelected: this.isSelected,
              toggle: this.toggle
            }}
            sectionListItem={SectionItem}
            sectionHeader={SectionHeader}
            sectionHeaderHeight={22.5}
          />
          : undefined}
        <View style={styles.rowButton}>
          <Button title='Back' onPress={() => this.viewPager.setPage(1)} />
        </View>
      </View>
    )

    return (
      <View style={styles.container}>
        <ViewPagerPage pages={[page1, page2, page3]} reference={v => { this.viewPager = v }} />
      </View>
    )
  }
}

NewGroup.propTypes = {
  loading: PropTypes.bool.isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    setParams: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.object
    })
  }),
  user: PropTypes.shape({
    id: PropTypes.number,
    friends: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        username: PropTypes.string
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
  selected: PropTypes.arrayOf(PropTypes.object)
}

const userQuery = graphql(USER_QUERY, {
  skip: ownProps => !ownProps.auth || !ownProps.auth.jwt,
  options: ownProps => ({ variables: { id: ownProps.auth.id } }),
  props: ({ data: { loading, user } }) => ({
    loading,
    user
  })
})

const tagQuery = graphql(TAG_QUERY, {
  skip: ownProps => !ownProps.auth || !ownProps.auth.jwt,
  props: ({ data: { tags } }) => ({
    tags
  })
})

const mapStateToProps = ({ auth }) => ({
  auth
})

export default compose(connect(mapStateToProps), userQuery, tagQuery)(NewGroup)
