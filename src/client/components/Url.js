import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from '../styles/Urls.css'

export default class Url extends Component {

  render() {
    return (
      <div className={style.Urls}>
        <a target="_new" href={this.props.url}>
          {this.props.url}
        </a>
        &nbsp;
        <strong>{this.props.count}</strong>
      </div>
    )
  }
}

Url.propTypes = {
  url: PropTypes.string,
  count: PropTypes.number
}
