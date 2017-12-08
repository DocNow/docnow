import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import ia from '../images/ia.png'
import style from '../styles/Wayback.css'

export default class Wayback extends Component {

  componentWillMount() {
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
        <a className={style.Wayback + ' ' + style.WaybackFound}
          href={this.props.archive.url}
          target="_new">
          <img title={title} alt={title} src={ia} />
        </a>
      )
    } else if (this.props.archive && this.props.archive.error) {
      const title = 'Internet Archive cannot archive!'
      return (
        <span className={style.Wayback + ' ' + style.WaybackError}>
          <img onClick={() => {this.saveArchive()}} title={title} alt={title} src={ia} />
        </span>
      )
    } else {
      const title = 'Click to archive at Internet Archive'
      return (
        <span className={style.Wayback}>
          <img onClick={() => {this.saveArchive()}} title={title} alt={title} src={ia} />
        </span>
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
