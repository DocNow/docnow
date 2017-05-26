import React, { Component } from 'react'
import styles from './Header.css'
import dn from '../images/dn.png'
import Login from './Login'

export default class Header extends Component {
  render() {
    return (
      <header className={styles.Header}>
        <div className={styles.Logo}><a href="/">
          <img className={styles.Avatar} src={ dn } /></a>
        </div>
        <div className={styles.Login}><Login /></div>
      </header>
    )
  }
}
