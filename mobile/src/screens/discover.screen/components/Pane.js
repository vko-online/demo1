import React, { Component } from 'react'
import {
  Animated,
  PixelRatio,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import PropTypes from 'prop-types'

import { metrics, darken, colors, fontSize } from '../../../components/theme.component'

import Preview from './Preview'
import ProfileCard from './ProfileCard'

const isAndroid = Platform.OS === 'android'

const ProfilePreview = ({ profile, isEngaged }) => {
  return (
    <Preview
      isActive={isEngaged}
      position='bottom'
      title={profile.username}
    />
  )
}

ProfilePreview.propTypes = {
  profile: PropTypes.object,
  isEngaged: PropTypes.bool
}

// class ProfilePreviewPrev extends Component {
//   static propTypes = {
//     profile: PropTypes.object,
//     isEngaged: PropTypes.bool
//   };

//   render () {
//     const { profile, isEngaged } = this.props
//     const preview = <ProfilePreview isEngaged={isEngaged} profile={profile} />

//     return (
//       <View ref='prevProfilePreview' style={{ opacity: 1 }}>
//         {preview}
//       </View>
//     )
//   }
// }

class ProfilePreviewNext extends Component {
  static propTypes = {
    profile: PropTypes.object,
    isEngaged: PropTypes.bool,
    onPress: PropTypes.func
  };

  state = {
    animValue: 0
  };

  render () {
    const { profile, isEngaged, onPress } = this.props
    const preview = <ProfilePreview isEngaged={isEngaged} profile={profile} />

    // return (
    //   <Animated.View style={{ opacity: this.state.animValue }}>
    //     <TouchableHighlight
    //       onPress={onPress}
    //       underlayColor={darken(theme.color.sceneBg, 10)}
    //     >
    //       <View>
    //         {preview}
    //       </View>
    //     </TouchableHighlight>
    //   </Animated.View>
    // )
    if (isAndroid) {
      return (
        <Animated.View style={{ opacity: this.state.animValue }}>
          <TouchableWithoutFeedback
            underlayColor={darken(colors.sceneBg, 10)}
            onPress={onPress}
          >
            <View>
              {preview}
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      )
    } else {
      return (
        <View ref='nextProfilePreview' style={{ opacity: 0.5 }}>
          {preview}
        </View>
      )
    }
  }
}

export default class ProfilePane extends Component {
  static propTypes = {
    nextProfile: PropTypes.object,
    nextProfilePreviewIsEngaged: PropTypes.bool,
    onHeroLayout: PropTypes.func,
    onLike: PropTypes.func,
    onDislike: PropTypes.func,
    onPressNext: PropTypes.func,
    onScroll: PropTypes.func,
    onScrollEndDrag: PropTypes.func,
    prevProfile: PropTypes.object,
    prevProfilePreviewIsEngaged: PropTypes.bool,
    visibleProfile: PropTypes.object
  };

  state = {
    animValue: new Animated.Value(0)
  };

  static defaultProps = {
    nextProfilePreviewIsEngaged: false,
    prevProfilePreviewIsEngaged: false
  };

  componentDidMount () {
    if (isAndroid) {
      this.fadeInAndroidNextButton()
    }
  }

  componentWillReceiveProps (nextProps) {
    if (isAndroid) {
      this.fadeInAndroidNextButton()
    }
  }

  fadeInAndroidNextButton = () => {
    this.state.animValue.setValue(0)
    Animated.timing(this.state.animValue, {
      toValue: 1,
      duration: 300
    }).start()
  };

  render () {
    const {
      nextProfile,
      nextProfilePreviewIsEngaged,
      onHeroLayout,
      onLike,
      onDislike,
      onPressNext,
      prevProfile,
      prevProfilePreviewIsEngaged,
      visibleProfile,
      ...props
    } = this.props

    const scrollAreaStyle = isAndroid
      ? styles.scrollAreaAndroid
      : styles.scrollAreaIos

    return (
      <ScrollView
        ref='scrollview'
        scrollEventThrottle={60}
        style={{ flex: 1 }}
        {...props}
      >
        <View style={scrollAreaStyle}>
          <View ref='summary'>
            <ProfileCard profile={visibleProfile} onDislike={onDislike} onLike={onLike} />
          </View>

          {nextProfile &&
            <ProfilePreviewNext
              isEngaged={nextProfilePreviewIsEngaged}
              profile={nextProfile}
              onPress={onPressNext}
            />}
        </View>

      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomColor: colors.gray20,
    borderBottomWidth: 1 / PixelRatio.get(),
    borderTopColor: colors.gray20,
    borderTopWidth: 1 / PixelRatio.get(),
    marginTop: -(1 / PixelRatio.get()),
    paddingHorizontal: fontSize.large,
    paddingBottom: fontSize.xlarge,
    paddingTop: fontSize.xlarge
  },
  heroSpeaker: {
    alignItems: 'center',
    paddingHorizontal: fontSize.xlarge
  },
  heroSpeakerHint: {
    color: colors.gray40,
    fontSize: fontSize.xsmall,
    paddingBottom: fontSize.large
  },
  heroSpeakerName: {
    color: colors.blue,
    fontSize: fontSize.default,
    fontWeight: '500',
    marginTop: fontSize.small
  },
  heroTitle: {
    fontSize: fontSize.large,
    fontWeight: '300',
    textAlign: 'center'
  },
  heroLink: {
    marginTop: 10,
    borderBottomWidth: 1 / PixelRatio.get(),
    borderBottomColor: colors.blue
  },
  heroLinkText: {
    color: colors.blue
  },
  summaryText: {
    fontSize: fontSize.default,
    fontWeight: '300',
    lineHeight: fontSize.large,
    padding: fontSize.large
  },
  scrollAreaIos: {
    flex: 1
  },
  scrollAreaAndroid: {
    flex: 2,
    minHeight: metrics.profilePaneAndroidMinScrollAreaHeight
  }
})
