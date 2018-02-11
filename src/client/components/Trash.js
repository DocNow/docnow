import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './Trash.css'

export default class Trash extends Component {

  confirmDelete() {
    this.props.deleteSearch({id: this.props.id})
  }

  render() {
    return (
      <i
        className={style.Trash + ' fa fa-trash'}
        aria-hidden="true"
        onClick={() => {this.confirmDelete()}} />
    )
  }

}

Trash.propTypes = {
  id: PropTypes.string,
  deleteSearch: PropTypes.func
}
