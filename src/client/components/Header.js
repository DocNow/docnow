import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import dn from '../images/dn.png'
import Login from './Login'
import styles from './Header.css'

export default class Header extends Component {
  render() {
    return (
      <header className={styles.Header}>
        <div className={styles.Logo}>
          <Link to="/">
            <img className={styles.Logo} src={ dn } />
          </Link>
        </div>
        <div className={styles.Login}>
          <Login
            twitterScreenName={this.props.twitterScreenName}
            twitterAvatarUrl={this.props.twitterAvatarUrl} />
        </div>
      </header>
    )
  }
}

Header.propTypes = {
  twitterScreenName: PropTypes.string,
  twitterAvatarUrl: PropTypes.string
}
