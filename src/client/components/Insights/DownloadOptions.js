import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './DownloadOptions.css'

export default class DownloadOptions extends Component {

  render() {
    return (
      <div className={style.DownloadOptions}>
        <button type="button">
          <i className="fa fa-download" aria-hidden="true" />
          &nbsp;
          Full Data
        </button>
        <button type="button">
          <i className="fa fa-download" aria-hidden="true" />
          &nbsp;
          Selected
        </button>
      </div>
    )
  }

}

DownloadOptions.propTypes = {
  id: PropTypes.string
}
