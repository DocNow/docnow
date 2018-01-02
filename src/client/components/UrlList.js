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
          <ul>
          {this.props.urls.map(u => (
            <li key={u.url}>
              <Url url={u.url} count={u.count} />
            </li>
          ))}
          </ul>
        </div>
    )
  }
}

UrlList.propTypes = {
  urls: PropTypes.array
}
