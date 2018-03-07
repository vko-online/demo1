import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'

import { Text, Paragraph } from './text.component'
import { colors } from './theme.component'

const styles = StyleSheet.create({
  tabContainer: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  tab: {
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.actionText,
    paddingVertical: 5,
    paddingHorizontal: 10,
    width: 100,
    alignItems: 'center'
  }
})

const CustomTabBar = ({
  navigation,
  navigationState,
  getLabel,
  renderIcon,
  activeTintColor,
  inactiveTintColor
}) => (
  <View style={styles.tabContainer}>
    {navigationState.routes.map((route, idx) => {
      const color = navigationState.index === idx ? 'white' : colors.actionText
      const bgColor = navigationState.index === idx ? colors.actionText : 'white'
      const firstStyle = idx === 0 ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 } : null
      const lastStyle = idx === navigationState.routes.length - 1 ? { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } : null
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate(route.routeName)}
          style={[styles.tab, firstStyle, lastStyle, {backgroundColor: bgColor}]}
          key={route.routeName}
        >
          <Paragraph style={{ color }}>
            {getLabel({ route })}
          </Paragraph>
        </TouchableOpacity>
      )
    })}
  </View>
)

CustomTabBar.propTypes = {
  navigation: PropTypes.object,
  navigationState: PropTypes.any,
  getLabel: PropTypes.func,
  renderIcon: PropTypes.func,
  activeTintColor: PropTypes.string,
  inactiveTintColor: PropTypes.string
}

export default CustomTabBar
