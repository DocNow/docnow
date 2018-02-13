import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './DownloadOptions.css'

export default class DownloadOptions extends Component {

  createArchive() {
    this.props.createArchive({id: this.props.searchId})
  }

  render() {
    let text = 'Create Archive'
    let onClick = () => {this.createArchive()}

    if (this.props.active) {
      return (<div />)
    } else if (this.props.archiveStarted) {
      text = 'Creating Archive'
      onClick = null
    } else if (this.props.archived) {
      text = 'Download Archive'
      onClick = () => {
        const url = `/userData/archives/${this.props.searchId}.zip`
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
  searchId: PropTypes.string,
  active: PropTypes.bool,
  archived: PropTypes.bool,
  archiveStarted: PropTypes.bool,
  createArchive: PropTypes.func
}
