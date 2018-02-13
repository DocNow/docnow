import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './DownloadOptions.css'

export default class DownloadOptions extends Component {

  createArchive() {
    this.props.createArchive(this.props.search)
  }

  render() {
    const s = this.props.search

    let text = 'Create Archive'
    let onClick = () => {this.createArchive()}

    if (s.active) {
      return (<div />)
    } else if (s.archiveStarted) {
      text = 'Creating Archive'
      onClick = null
    } else if (s.archived) {
      text = 'Download Archive'
      onClick = () => {
        const url = `/userData/archives/${s.id}.zip`
        window.location = url
      }
    }

    return (
      <div className={style.DownloadOptions}>
        <button type="button" onClick={onClick}>
          <i className="fa fa-download" aria-hidden="true" />
          &nbsp;
          { text }
        </button>
      </div>
    )
  }

}

DownloadOptions.propTypes = {
  search: PropTypes.object,
  createArchive: PropTypes.func
}
