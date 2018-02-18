import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  LayoutAnimation,
  TouchableHighlight
} from 'react-native'
import PropTypes from 'prop-types'
import { Text } from './text.component'
import { colors, lighten } from './theme.component'

class Row extends Component {
  static propTypes = {
    question: PropTypes.string,
    answer: PropTypes.string
  };

  state = {
    expanded: false
  };

  render () {
    let answer
    if (this.state.expanded) {
      answer = (
        <View style={styles.answer}>
          <Text style={styles.answerText}>
            {this.props.answer}
          </Text>
        </View>
      )
    }
    return (
      <View style={styles.row}>
        <TouchableHighlight onPress={this.toggle}>
          <View style={styles.question}>
            <Text style={styles.symbol}>
              {this.state.expanded ? '\u2212' : '+'}
            </Text>
            <Text style={styles.text}>
              {this.props.question}
            </Text>
          </View>
        </TouchableHighlight>
        {answer}
      </View>
    )
  }

  toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    this.setState({ expanded: !this.state.expanded })
  };
}

class FaqList extends Component {
  static propTypes = {
    faqs: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        question: PropTypes.string,
        answer: PropTypes.string
      })
    )
  };
  render () {
    return (
      <View>
        {this.props.faqs.map(({ question, answer }) => (
          <Row question={question} answer={answer} key={question} />
        ))}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  separator: {
    marginHorizontal: 20
  },
  question: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    backgroundColor: 'white'
  },
  symbol: {
    fontSize: 15,
    lineHeight: 21,
    width: 22,
    color: '#99A7B9'
  },
  answer: {
    padding: 14,
    paddingLeft: 20 + 22
  },
  answerText: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily: 'markweb',
    color: lighten(colors.darkText, 30),
    flex: 1
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.darkText,
    flex: 1
  }
})

export default FaqList
