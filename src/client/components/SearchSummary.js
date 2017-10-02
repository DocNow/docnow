import React, { Component } from 'react'
import PropTypes from 'prop-types'

import style from '../styles/Intro.css'
import button from '../styles/Button.css'

export default class SearchSummary extends Component {

  constructor(props) {
    super(props)
    this.intervalId = null
  }

  componentDidUpdate() {
    if (this.props.id && this.intervalId === null) {
      this.props.getSearch(this.props.id)
      this.intervalId = setInterval(() => {
        this.props.getSearch(this.props.id)
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
  id: PropTypes.string,
  maxDate: PropTypes.string,
  minDate: PropTypes.string,
  count: PropTypes.number,
  getSearch: PropTypes.func
}
