import {
  StyleSheet
} from 'react-native'

import { colors, metrics } from '../../components/theme.component'

export default StyleSheet.create({
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
    height: metrics.navbarHeight + metrics.statusBarHeight,
    paddingTop: 30
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
