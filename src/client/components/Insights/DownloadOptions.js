import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './DownloadOptions.css'
import Button from '@material-ui/core/Button'

export default class DownloadOptions extends Component {

  createArchive() {
    this.props.createArchive({id: this.props.searchId})
  }

  render() {
    let text = 'Create Archive'
    let onClick = () => {this.createArchive()}
    let disabled = false
    let titleTxt = ''

    if (this.props.active) {
      disabled = true
      titleTxt = <span className={style.DownloadInfo}>Stop collecting to download.</span>
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
        <Button variant="contained" onClick={onClick} disabled={disabled}>
          <ion-icon name="download"></ion-icon>
          &nbsp;
          { text }
        </Button>
        {titleTxt}
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
