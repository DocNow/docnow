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

    let terms = <span className={style.TermsNotAgreed}>Not Read</span>
    if (this.props.termsOfService) {
      terms = <span className={style.TermsAgreed}>Read</span>
    }
    let access = <span className={style.Provisional}>Provisional</span>
    if (this.props.active) {
      access = <span className={style.Full}>Full Access</span>
    }

    return (
      <nav className={style.AppBar}>
        <Link to="/profile/">
          <ion-icon name="contact"></ion-icon> Account Profile - {access} 
        </Link>
        <Link to="/termsofservice/">
          <ion-icon name="document"></ion-icon> Terms of Service - {terms} 
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
  termsOfService: PropTypes.bool,
  active: PropTypes.bool,
  notifications: PropTypes.number,
}
