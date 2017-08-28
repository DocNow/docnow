import React, { Component } from 'react'
import PropTypes from 'prop-types'
import dn from '../images/dn.png'
import mith from '../images/mith.png'
import AppBar from './AppBar'
import styles from './Header.css'

export default class Header extends Component {
  render() {
    let appBar = null
    let avatar = dn
    if (this.props.twitterScreenName && this.props.twitterAvatarUrl) {
      appBar = <AppBar />
      avatar = this.props.twitterAvatarUrl
    }
    return (
      <div>
        {appBar}
        <header className={styles.Header}>
          <avatar><img src={avatar}/></avatar>
          <logo><center><img src={mith}/></center></logo>
        </header>
      </div>
    )
  }
}

Header.propTypes = {
  twitterScreenName: PropTypes.string,
  twitterAvatarUrl: PropTypes.string,
  getUser: PropTypes.func
}
