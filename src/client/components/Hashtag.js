import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from '../styles/Hashtags.css'

export default class Hashtag extends Component {

  addHastag(url, tag) {
    const prefixedTag = '%20%23' + tag
    if (!url.includes(prefixedTag)) {
      return url + prefixedTag
    }
    return url
  }

  render() {
    return (
      <div className={style.Hashtags}>
        #{this.props.data.hashtag} <strong>{this.props.data.count}</strong>
        &nbsp; <a href={this.addHastag(window.location.href, this.props.data.hashtag)}>click to add</a>
      </div>
    )
  }
}

Hashtag.propTypes = {
  data: PropTypes.object
}
