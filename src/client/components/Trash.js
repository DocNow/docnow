import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './Trash.css'

export default class Trash extends Component {

  render() {
    return (
      <a href="">
        <i className={style.Trash + ' fa fa-trash'} aria-hidden="true" />
      </a>
    )
  }

}

Trash.propTypes = {
  id: PropTypes.string
}
