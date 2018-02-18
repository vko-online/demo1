import React, { Component } from 'react'
import { StyleSheet, Dimensions } from 'react-native'
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view'
import { Ionicons } from '@expo/vector-icons'

import { colors } from '../components/theme.component'

import Connection from './connection.screen'
import Discover from './discover.screen'
import Profile from './profile.screen'

const initialLayout = {
  height: 0,
  width: Dimensions.get('window').width
}

export default class Tab extends Component {
  state = {
    index: 1,
    routes: [
      { key: 'Connection', icon: 'ios-link' },
      { key: 'Discover', icon: 'ios-search' },
      { key: 'Profile', icon: 'ios-contact' }
    ]
  };

  handleIndexChange = index => this.setState({ index });

  renderIcon = ({ route }) => (
    <Ionicons name={route.icon} size={24} color={colors.white} />
  );

  renderHeader = props => {
    return (
      <TabBar
        {...props}
        renderIcon={this.renderIcon}
        indicatorStyle={{backgroundColor: 'transparent'}}
        style={styles.tabbar}
      />
    )
  };

  renderScene = SceneMap({
    Connection: () => <Connection {...this.props} />,
    Discover: () => <Discover {...this.props} />,
    Profile: () => <Profile {...this.props} />
  });

  render () {
    return (
      <TabViewAnimated
        style={styles.container}
        navigationState={this.state}
        renderScene={this.renderScene}
        renderHeader={this.renderHeader}
        onIndexChange={this.handleIndexChange}
        initialLayout={initialLayout}
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  tabbar: {
    paddingTop: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
    justifyContent: 'space-between'
  }
})
