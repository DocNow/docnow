import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from '../styles/Media.css'
import Medium from './Medium'

export default class Media extends Component {

  render() {
    let loader = null
    if (this.props.tweets.length === 0) {
      loader = 'Loading...'
    }
    return (
        <div className={style.Box}>
          {loader}
          {this.props.tweets.map(tweet => (
            tweet.images.map((medium, idx) => (
              <Medium key={tweet.id + '_m' + idx} data={medium}/>
            ))
          ))}
        </div>
    )
  }
}

Media.propTypes = {
  tweets: PropTypes.array
}
