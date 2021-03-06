import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './Url.css'

export default class Url extends Component {

  render() {
    return (
      <div className={style.Url}>
        <span className={style.Number}><strong>{this.props.count}</strong></span>
        <a target="_new" href={this.props.url}>
          {this.props.url}
        </a>


      </div>
    )
  }
}

Url.propTypes = {
  url: PropTypes.string,
  count: PropTypes.number
}
