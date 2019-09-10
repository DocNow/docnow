import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

import style from './SearchSummary.css'
import "@material/elevation/mdc-elevation.scss"

export default class SearchSummary extends Component {

  render() {
    if (this.props.tweetCount) {
      const minDate = moment(this.props.minDate).local().format('MMM D h:mm A')
      const maxDate = moment(this.props.maxDate).local().format('MMM D h:mm A')
      return (
        <div className={style.Summary}>
          Loaded <span className={style.Count}>{this.props.tweetCount}</span> tweets from <time>{minDate}</time> to <time>{maxDate}</time> from the Twitter Search API.
        </div>
      )
    } else if (this.props.id) {
      return <div className={`mdc-elevation--z4 ${style.Summary}`}>Loading up to 1,000 recent tweets from Twitter matching your query</div>
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
