import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

import style from './SearchSummary.css'

export default class SearchSummary extends Component {

  render() {
    if (this.props.tweetCount) {
      const minDate = moment(this.props.minDate).local().format('MMM D h:mm A')
      const maxDate = moment(this.props.maxDate).local().format('MMM D h:mm A')
      return (
        <div className={style.Summary}>
          <span className={style.Count}>{this.props.tweetCount}</span> tweets
          from <time>{minDate}</time> to <time>{maxDate}</time>&nbsp;
          from the Twitter Search API.
        </div>
      )
    } else if (this.props.id) {
      return <div className={style.Summary}>Loading data...</div>
    } else {
      return <div />
    }
  }
}

SearchSummary.propTypes = {
  id: PropTypes.string,
  maxDate: PropTypes.string,
  minDate: PropTypes.string,
  tweetCount: PropTypes.number,
  hashtagCount: PropTypes.number,
  active: PropTypes.bool
}
