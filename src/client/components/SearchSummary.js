import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

import style from '../styles/Intro.css'
import searchStyle from '../styles/Search.css'

export default class SearchSummary extends Component {

  update() {
    this.props.updateSearch({id: this.props.id})
  }

  render() {
    let message = 'Loading...'
    if (this.props.count > 0) {
      const minDate = moment(this.props.minDate).local().format('MMM D h:mm A')
      const maxDate = moment(this.props.maxDate).local().format('MMM D h:mm A')
      message = (
        <div>
          <span className={searchStyle.Count}>{this.props.count}</span> tweets
          from <time>{minDate}</time> to <time>{maxDate}</time> from
          the Twitter Search API.
        </div>
      )
    }

    let button = <button onClick={() => {this.update()}}>Update</button>
    if (this.props.active === true) {
      button = <button>Updating</button>
    }

    return (
      <div className={style.Intro}>
        <p>{message}</p>
        {button}
      </div>
    )
  }
}

SearchSummary.propTypes = {
  maxDate: PropTypes.string,
  minDate: PropTypes.string,
  count: PropTypes.number,
  id: PropTypes.string,
  active: PropTypes.bool,
  updateSearch: PropTypes.func,
}
