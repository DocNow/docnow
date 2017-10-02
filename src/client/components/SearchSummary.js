import React, { Component } from 'react'
import PropTypes from 'prop-types'

import style from '../styles/Intro.css'
import button from '../styles/Button.css'

export default class SearchSummary extends Component {

  render() {
    let message = 'Loading...'
    if (this.props.count > 0) {
      message = `${this.props.count} tweets from ${this.props.minDate} to ${this.props.maxDate} from the Twitter Search API.`
    }
    return (
      <div className={style.Intro}>
        <div>{message}</div>
        <button>Update</button>
      </div>
    )
  }
}

SearchSummary.propTypes = {
  maxDate: PropTypes.string,
  minDate: PropTypes.string,
  count: PropTypes.number,
}
