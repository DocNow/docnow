import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from '../styles/Media.css'
import Medium from './Medium'

export default class Media extends Component {

  componentDidUpdate() {
    if (this.props.id && this.props.tweets.length === 0) {
      this.props.getTweets(this.props.id)
    }
  }

  render() {
    let loader = null
    if (this.props.tweets.length === 0) {
      loader = 'Loading...'
    }
    return (
        <div className={style.Box}>
          {loader}
          {this.props.tweets.map(tweet => (
            tweet.photos.map((medium, idx) => (
              <Medium key={tweet.id + '_m' + idx} data={medium}/>
            ))
          ))}
        </div>
    )
  }
}

Media.propTypes = {
  id: PropTypes.string,
  getTweets: PropTypes.func,
  tweets: PropTypes.array
}
