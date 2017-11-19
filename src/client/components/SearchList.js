import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from '../styles/SavedSearch.css'

export default class SavedSearch extends Component {
  render() {
    return (
      <h1 className={style.Heading}>Hi {this.props.searchId}</h1>
    )
  }
}

SavedSearch.propTypes = {
  'searchId': PropTypes.string
}
