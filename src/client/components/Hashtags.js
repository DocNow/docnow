import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './Search.css'
import Hashtag from './Hashtag'

export default class Hashtags extends Component {

  componentDidUpdate() {
    if (this.props.endpoint && this.props.hashtags.length === 0) {
      this.props.getHashtags(this.props.endpoint)
    }
  }

  render() {
    let loader = null
    if (this.props.hashtags.length === 0) {
      loader = 'Loading...'
    }
    return (
        <div className={ style.Box }>
          {loader}
          {this.props.hashtags.map(ht => (
            <Hashtag key={ht.hashtag} data={ht}/>
          ))}
        </div>
    )
  }
}

Hashtags.propTypes = {
  endpoint: PropTypes.string,
  getHashtags: PropTypes.func,
  hashtags: PropTypes.array
}
