import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import styles from '../styles/AppBar.css'

export default class AppBar extends Component {

  render() {
    return (
      <nav className={styles.AppBar}>
          <a href="/auth/logout"> <i className="fa fa-user" aria-hidden="true"/> Logout</a>
          <Link to="/profile/"> <i className="fa fa-cog" aria-hidden="true"/> Settings</Link>
      </nav>
    )
  }

}
