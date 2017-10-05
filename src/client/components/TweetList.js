import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Tweet from './Tweet'

import style from '../styles/Tweets.css'

export default class TweetList extends Component {

  render() {
    let loader = null
    if (this.props.tweets.length === 0) {
      loader = 'Loading...'
    }
    return (
        <div className={ style.TweetsCard }>
          {loader}
          {this.props.tweets.map(tweet => (
            <Tweet key={tweet.id} data={tweet}/>
          ))}
        </div>
    )
  }
}

TweetList.propTypes = {
  tweets: PropTypes.array
}
