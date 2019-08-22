import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Url from './Url'
import exploreStyles from './Explore.css'
import styles from './UrlList.css'
import animations from '../animations.css'

export default class UrlList extends Component {

  render() {
    let loader = null
    if (this.props.urls.length === 0) {
      loader = (<span className={`${animations.Spin} ${exploreStyles.Loader}`}>
        <ion-icon name="logo-ionic"></ion-icon>
      </span>)
    }
    return (
        <div className={`${styles.UrlList} ${exploreStyles.InnerCard}`}>
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
