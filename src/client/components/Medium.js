import React, { Component } from 'react'
import style from './Media.css'
import PropTypes from 'prop-types'

export default class Medium extends Component {

  render() {
    let medium = null
    if (this.props.data.type === 'image') {
      medium = <a href={this.props.data.url} target="_blank"><img src={this.props.data.url} /></a>
    } else {
      medium = (
        <a href={this.props.data.url} target="_blank">
          <svg className={ style.play } viewBox="0 0 200 200" alt="Play video">
              <circle cx="100" cy="100" r="90" fill="none" strokeWidth="15" stroke="#000"/>
              <polygon points="70, 55 70, 145 145, 100" fill="#000"/>
          </svg>
        </a>)
    }
    return (
      <div className={ style.Medium }>{medium}</div>
    )
  }
}

Medium.propTypes = {
  data: PropTypes.object
}
