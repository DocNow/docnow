import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from '../styles/SearchList.css'

export default class SearchList extends Component {
  render() {
    return (
      <h1 className={style.Header}>Saved Search</h1>
    )
  }
}

SearchList.propTypes = {
  'searchId': PropTypes.string
}
