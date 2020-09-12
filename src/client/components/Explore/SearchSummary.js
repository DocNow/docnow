import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

import style from './SearchSummary.css'
import Paper from '@material-ui/core/Paper'


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
      return <Paper elevation={4} className={style.Summary}>Loading up to 1,000 recent tweets from Twitter matching your query</Paper>
    } else {
      return <div />
    }
  }
}

SearchSummary.propTypes = {
  id: PropTypes.number,
  maxDate: PropTypes.string,
  minDate: PropTypes.string,
  tweetCount: PropTypes.number,
  hashtagCount: PropTypes.number,
  active: PropTypes.bool
}
