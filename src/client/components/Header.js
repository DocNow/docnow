import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import MediaQueryComponent from './MediaQueryComponent'
import dn from '../images/dn.png'
import AppBar from './AppBar'
import TabBar from './TabBar'

import styles from './Header.css'

export default class Header extends MediaQueryComponent {
  componentDidMount() {
    this.setMediaQuery('(max-width: 480px)', styles.Header, styles.HeaderUnder480px)
  }

  render() {
    let appBar = null
    let tabBar = null
    let logo = null
    if (this.props.logoUrl) {
      logo = (
        <a href={this.props.instanceInfoLink}>
          <img title={this.props.instanceDescription} src={this.props.logoUrl}/>
        </a>
      )
    } else {
      logo = ''
    }

    // if logged in give them the app and tab bar
    if (this.props.twitterScreenName && this.props.twitterAvatarUrl) {
      appBar = (
        <AppBar
          notifications={this.props.notifications}
          isSuperUser={this.props.isSuperUser} />
      )
      tabBar = <TabBar 
        isSuperUser={this.props.isSuperUser}
        location={this.props.location}
        navigateTo={this.props.navigateTo} />
    }

    return (
      <div>
        {appBar}
        <header className={this.state.mediaStyle}>
          <div className={styles.AppIcon}>
            <Link to={'/'}>
              <img src={dn}/>
            </Link>
          </div>
          <div className={styles.Logo}><center>{logo}</center></div>
        </header>
        {tabBar}
      </div>
    )
  }
}

Header.propTypes = {
  twitterScreenName: PropTypes.string,
  twitterAvatarUrl: PropTypes.string,
  getUser: PropTypes.func,
  location: PropTypes.string,
  logoUrl: PropTypes.string,
  isSuperUser: PropTypes.bool,
  notifications: PropTypes.number,
  navigateTo: PropTypes.func
}
