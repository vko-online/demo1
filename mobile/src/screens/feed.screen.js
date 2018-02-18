import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { Paragraph } from '../components/text.component'

const styles = StyleSheet.create({
  container: {
    paddingTop: 20
  }
})

class Feed extends Component {
  static navigationOptions = {
    tabBarLabel: 'Feed',
    tabBarIcon: ({ tintColor }) => (
      <Ionicons color={tintColor} name='ios-notifications-outline' size={30} />
    ),
    header: null
  }
  render () {
    return (
      <View style={styles.container}>
        <Paragraph>Feed</Paragraph>
      </View>
    )
  }
}

export default Feed
