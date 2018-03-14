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
          <i className="fa fa-gears" aria-hidden="true" /> Settings {notifications}
        </Link>
      )
    }
    return (
      <nav className={style.AppBar}>
          <a href="/auth/logout">
            <i className="fa fa-sign-out" aria-hidden="true"/> Logout
          </a>
          <Link to="/profile/">
            <i className="fa fa-user" aria-hidden="true"/> Profile
          </Link>
          {admin}
      </nav>
    )
  }

}

AppBar.propTypes = {
  isSuperUser: PropTypes.bool,
  notifications: PropTypes.number,
}
