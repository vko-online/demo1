import moment from 'moment'
import { Platform, Dimensions } from 'react-native'

const colors = {
  background: '#e9e9ef',
  white: '#fff',
  black: '#000',
  darkText: '#032250',
  lightText: '#7F91A7',
  actionText: '#405cff',
  inactiveText: '#9B9B9B',
  darkBackground: '#183E63',
  borderColor: '#EEE',
  lightRed: '#86A100',
  chocolate: '#222',

  blue: '#00A8D8',
  green: '#9BE13A',
  lightGreen: '#00f792',
  text: '#383838',
  splashBg: '#2B2828',
  sceneBg: '#F4F4F4',
  yellow: '#FFC979',

  activeColor: '#2f74fa',

  colorForList: (count, index) => {
    const hue = Math.round(360 * index / (count + 1))
    return `hsl(${hue}, 74%, 65%)`
  },

  // neutrals
  gray90: '#1A1A1A',
  gray80: '#333',
  gray70: '#4D4D4D',
  gray60: '#666',
  gray50: '#7F7F7F',
  gray40: '#999',
  gray35: '#A6A6A6',
  gray30: '#B3B3B3',
  gray25: '#BFBFBF',
  gray20: '#CCC',
  gray15: '#D9D9D9',
  gray10: '#E5E5E5',
  gray05: '#F2F2F2'
}

// font sizes
const fontSize = {
  xsmall: 12,
  small: 14,
  default: 17,
  large: 24,
  xlarge: 32
}

const formatDate = createdAt =>
  moment(createdAt).calendar(null, {
    sameDay: 'hh:mm [Today]',
    nextDay: 'hh:mm [Tomorrow]',
    nextWeek: 'hh:mm dddd',
    lastDay: 'hh:mm [Yesterday]',
    lastWeek: 'hh:mm dddd',
    sameElse: 'hh:mm ddd DD MMM'
  })

const metrics = {
  textInputHeight: 40,
  statusBarHeight: 20,
  nextupHeight: Platform.OS === 'ios' ? 70 : 110,
  profilePaneAndroidMinScrollAreaHeight: Dimensions.get('window').height - 48,
  navbarHeight: Platform.OS === 'ios' ? 64 : 44
}

const mapStyle = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#242f3e'
      }
    ]
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#746855'
      }
    ]
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#242f3e'
      }
    ]
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563'
      }
    ]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563'
      }
    ]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [
      {
        color: '#263c3f'
      }
    ]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#6b9a76'
      }
    ]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        color: '#38414e'
      }
    ]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#212a37'
      }
    ]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9ca5b3'
      }
    ]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      {
        color: '#746855'
      }
    ]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#1f2835'
      }
    ]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#f3d19c'
      }
    ]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [
      {
        color: '#2f3948'
      }
    ]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563'
      }
    ]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#17263c'
      }
    ]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#515c6d'
      }
    ]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#17263c'
      }
    ]
  }
]

/**
Validate Hex
==============================

@param {String} hex

1. remove hash if present
2. convert from 3 to 6 digit color code & ensure valid hex
*/

function validateHex (color) {
  const hex = color.replace('#', '')

  if (hex.length === 3) {
    return hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  if (hex.length !== 6) {
    throw new Error(`Invalid color value provided: "${color}"`)
  }

  return hex
}

/**
Fade Color
==============================

Takes a hexidecimal color, converts it to RGB and applies an alpha value.

@param {String} color
@param {Number} opacity (0-100)

1. convert hex to RGB
2. combine and add alpha channel
*/

function fade (color, opacity = 100) {
  const decimalFraction = opacity / 100
  const hex = validateHex(color)

  // 1.
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // 2.
  const result = 'rgba(' + r + ',' + g + ',' + b + ',' + decimalFraction + ')'

  return result
}

/**
Shade Color
==============================

Takes a hexidecimal color, converts it to RGB and lightens or darkens

@param {String} color
@param {Number} opacity (0-100)

1. do fancy RGB bitwise operations
2. combine back into a hex value
*/

function shade (color, percent) {
  const decimalFraction = percent / 100
  const hex = validateHex(color)

  // 1.
  let f = parseInt(hex, 16)
  let t = decimalFraction < 0 ? 0 : 255
  let p = decimalFraction < 0 ? decimalFraction * -1 : decimalFraction

  const R = f >> 16
  const G = (f >> 8) & 0x00ff
  const B = f & 0x0000ff

  // 2.
  return (
    '#' +
    (0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B))
      .toString(16)
      .slice(1)
  )
}

// shade helpers
const lighten = shade
function darken (color, percent) {
  return shade(color, percent * -1)
}

/**
Blend Color
==============================

Takes two hexidecimal colors and blend them together

@param {String} color1
@param {String} color2
@param {Number} percent (0-100)

1. do fancy RGB bitwise operations
2. combine back into a hex value
*/

function blend (color1, color2, percent) {
  const decimalFraction = percent / 100
  const hex1 = validateHex(color1)
  const hex2 = validateHex(color2)

  // 1.
  const f = parseInt(hex1, 16)
  const t = parseInt(hex2, 16)

  const R1 = f >> 16
  const G1 = (f >> 8) & 0x00ff
  const B1 = f & 0x0000ff

  const R2 = t >> 16
  const G2 = (t >> 8) & 0x00ff
  const B2 = t & 0x0000ff

  // 2.
  return (
    '#' +
    (0x1000000 +
      (Math.round((R2 - R1) * decimalFraction) + R1) * 0x10000 +
      (Math.round((G2 - G1) * decimalFraction) + G1) * 0x100 +
      (Math.round((B2 - B1) * decimalFraction) + B1))
      .toString(16)
      .slice(1)
  )
}

export {
  colors,
  metrics,
  formatDate,
  mapStyle,
  blend,
  darken,
  fade,
  lighten,
  fontSize
}
