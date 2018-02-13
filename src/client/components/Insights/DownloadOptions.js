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
          Download Data
        </button>
      </div>
    )
  }

}

DownloadOptions.propTypes = {
  id: PropTypes.string
}
