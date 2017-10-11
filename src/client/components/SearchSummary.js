import React, { Component } from 'react'
import PropTypes from 'prop-types'

import style from '../styles/Intro.css'

export default class SearchSummary extends Component {

  update() {
    console.log(this.props)
    this.props.updateSearch({id: this.props.id})
  }

  render() {
    let message = 'Loading...'
    if (this.props.count > 0) {
      message = `${this.props.count} tweets from ${this.props.minDate} to ${this.props.maxDate} from the Twitter Search API.`
    }
    return (
      <div className={style.Intro}>
        <p>{message}</p>
        <button onClick={() => {this.update()}}>Update</button>
      </div>
    )
  }
}

SearchSummary.propTypes = {
  maxDate: PropTypes.string,
  minDate: PropTypes.string,
  count: PropTypes.number,
  id: PropTypes.string,
  updateSearch: PropTypes.func,
}
