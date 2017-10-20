import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Url from './Url'
import styles from '../styles/Urls.css'

export default class UrlList extends Component {

  render() {
    let loader = null
    if (this.props.urls.length === 0) {
      loader = 'Loading...'
    }
    return (
        <div className={styles.UrlsCard}>
          {loader}
          {this.props.urls.map(u => (
            <Url key={u.url} url={u.url} count={u.count} />
          ))}
        </div>
    )
  }
}

UrlList.propTypes = {
  urls: PropTypes.array
}
