import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './Search.css'
import Tweet from './Tweet'

export default class TweetList extends Component {

  componentDidUpdate() {
    if (this.props.endpoint && this.props.tweets.length === 0) {
      this.props.getTweets(this.props.endpoint)
    }
  }

  render() {
    let loader = null
    if (this.props.tweets.length === 0) {
      loader = 'Loading...'
    }
    return (
        <div className={ style.Box }>
          {loader}
          {this.props.tweets.map(tweet => (
            <Tweet key={tweet.id} data={tweet}/>
          ))}
        </div>
    )
  }
}

TweetList.propTypes = {
  endpoint: PropTypes.string,
  getTweets: PropTypes.func,
  tweets: PropTypes.array
}
