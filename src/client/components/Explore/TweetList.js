import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Tweet from './Tweet'

import exploreStyles from './Explore.css'
import animations from '../animations.css'

export default class TweetList extends Component {

  render() {
    let loader = null
    if (this.props.tweets.length === 0) {
      loader = (<span className={`${animations.Spin} ${exploreStyles.Loader}`}>
        <ion-icon name="logo-ionic"></ion-icon>
      </span>)
    }
    return (
      <div className={ exploreStyles.InnerCard }>
        {loader}
        {this.props.tweets.map(tweet => (
          <Tweet key={tweet.id} data={tweet} />
        ))}
      </div>
    )
  }
}

TweetList.propTypes = {
  tweets: PropTypes.array
}
