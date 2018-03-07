import {
  StyleSheet,
  Dimensions
} from 'react-native'

import { colors, metrics } from '../../components/theme.component'

const MARGIN_VERTICAL = 30
const MARGIN_HORIZONTAL = 20
const AVAILABLE_WIDTH = Dimensions.get('screen').width - MARGIN_HORIZONTAL * 2
const AVAILABLE_HEIGHT = Dimensions.get('screen').height - MARGIN_VERTICAL * 2

export default StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.chocolate
  },
  container: {
    flex: 1,
    marginTop: metrics.navbarHeight + metrics.statusBarHeight,
    backgroundColor: '#fff'
  },
  loading: {
    justifyContent: 'center',
    flex: 1
  },
  body: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  gradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 5,
    justifyContent: 'flex-end'
  },
  card: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginHorizontal: MARGIN_HORIZONTAL,
    marginVertical: MARGIN_VERTICAL,
    paddingTop: 0,
    overflow: 'hidden',
    alignItems: 'center'
  },
  placeholder: {
    backgroundColor: '#aaa',
    marginTop: 12.5,
    marginBottom: -30 + 12.5,
    zIndex: 1,
    height: 5,
    width: 30
  },
  placeholderScrolling: {
    marginBottom: -30,
    zIndex: 1,
    backgroundColor: 'transparent',
    height: 30,
    width: 30
  },
  profileImage: {
    height: AVAILABLE_HEIGHT,
    width: AVAILABLE_WIDTH
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.lightRed
  },
  phoneActions: {
    zIndex: 10,
    marginVertical: 20,
    marginHorizontal: 30,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  info: {
    marginLeft: 40
  },
  info__name: {
    backgroundColor: 'transparent',
    fontSize: 40,
    color: '#fff',
    fontFamily: 'brandon'
  },
  info__location: {
    backgroundColor: 'transparent',
    fontSize: 20,
    color: colors.lightText
  },
  info__age: {
    backgroundColor: 'transparent',
    fontSize: 60,
    color: '#fff',
    fontFamily: 'brandon'
  },
  info__status: {
    backgroundColor: 'transparent',
    fontSize: 20,
    color: colors.lightRed
  },
  info__phone: {
    backgroundColor: 'transparent',
    fontSize: 20,
    color: colors.lightText
  }
})
