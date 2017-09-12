import React, { Component } from 'react'
import PropTypes from 'prop-types'
import introStyles from '../styles/Intro.css'

export default class SearchSummary extends Component {

  constructor(props) {
    super(props)
    this.intervalId = null
  }

  componentDidUpdate() {
    if (this.props.endpoint && this.intervalId === null) {
      this.props.getSearchSummary(this.props.endpoint)
      this.intervalId = setInterval(() => {
        this.props.getSearchSummary(this.props.endpoint)
      }, 3000)
    }
  }

  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
    this.intervalId = null
  }

  render() {
    let message = <center>Loading...</center>
    if (this.props.count > 0) {
      message = <center>{this.props.count} tweets from {this.props.minDate} to {this.props.maxDate} from the Twitter Search API.</center>
    }
    return (
      <div className={introStyles.IntroP}>{message}</div>
    )
  }
}

SearchSummary.propTypes = {
  maxDate: PropTypes.instanceOf(Date),
  minDate: PropTypes.instanceOf(Date),
  count: PropTypes.number,
  endpoint: PropTypes.string,
  getSearchSummary: PropTypes.func
}
