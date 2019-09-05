import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

import ia from '../../images/ia.png'
import style from './Wayback.css'

import IconButton from '@material-ui/core/IconButton'

export default class Wayback extends Component {

  componentDidMount() {
    this.props.checkArchive(this.props.url)
  }

  saveArchive() {
    this.props.saveArchive(this.props.url)
  }

  render() {
    if (this.props.archive && this.props.archive.url) {
      const elapsed = moment(this.props.archive.time).fromNow()
      const title = `Last archived ${elapsed}`
      return (
        <IconButton aria-label="view on Internet Archive" 
          className={`${style.Wayback} ${style.WaybackFound}`}
          href={this.props.archive.url}
          target="_new">
          <img title={title} alt={title} src={ia} />
        </IconButton>
      )
    } else if (this.props.archive && this.props.archive.error) {
      const title = 'Internet Archive cannot archive!'
      return (
        <IconButton aria-label="archive at Internet Archive"
          className={`${style.Wayback} ${style.WaybackError}`}
          onClick={() => {this.saveArchive()}}>
          <img title={title} alt={title} src={ia} />
        </IconButton>
      )
    } else {
      const title = 'Click to archive at Internet Archive'
      return (
        <IconButton aria-label="archive at Internet Archive"
          className={style.Wayback}
          onClick={() => {this.saveArchive()}}>
          <img title={title} alt={title} src={ia} />
        </IconButton>
      )
    }
  }

}

Wayback.propTypes = {
  url: PropTypes.string,
  archive: PropTypes.object,
  checkArchive: PropTypes.func,
  saveArchive: PropTypes.func,
}
