import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import style from './AppBar.css'

export default class AppBar extends Component {

  render() {
    let admin = ''
    if (this.props.isSuperUser) {

      let notifications = ''
      if (this.props.notifications > 0) {
        notifications = (
          <span className={style.Notifications}>
            {this.props.notifications}
          </span>
        )
      }

      admin = (
        <Link to="/settings/">
          <ion-icon name="settings"></ion-icon> Settings {notifications}
        </Link>
      )
    }
    return (
      <nav className={style.AppBar}>

          <Link to="/profile/">
            <ion-icon name="contact"></ion-icon> Account Profile - <span className={style.Access}>Full Access</span>
          </Link>
          <Link to="/termsofservice/">
            <ion-icon name="document"></ion-icon> Terms of Service - <span className={style.Access}>Read</span>
          </Link>
          <a href="/auth/logout">
            <ion-icon name="log-out"></ion-icon> Logout
          </a>
          {admin}
      </nav>
    )
  }

}

AppBar.propTypes = {
  isSuperUser: PropTypes.bool,
  notifications: PropTypes.number,
}
