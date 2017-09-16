import React from 'react'
import MediaQueryComponent from './MediaQueryComponent'
import PropTypes from 'prop-types'
import dn from '../images/dn.png'
import mith from '../images/mith.png'
import AppBar from './AppBar'
import TabBar from './TabBar'

import styles from '../styles/Header.css'

export default class Header extends MediaQueryComponent {
  constructor(props) {
    super(props)
    this.state = { headerStyle: styles.header }
  }

  componentDidMount() {
    this.setMediaQuery('(max-width: 480px)', styles.header, styles.headerUnder480px)
  }

  render() {
    let appBar = null
    let tabBar = null
    let logo = null
    if (this.props.logoUrl) {
      logo = <img src={this.props.logoUrl}/>
    } else {
      logo = <img src={mith}/>
    }
    if (this.props.twitterScreenName && this.props.twitterAvatarUrl) {
      appBar = <AppBar />
      tabBar = <TabBar location={this.props.location}/>
    }

    return (
      <div>
        {appBar}
        <header className={this.state.mediaStyle}>
          <div className={styles.avatar}><a href="http://docnow.io"><img src={dn}/></a></div>
          <div className={styles.logo}><center>{logo}</center></div>
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
  logoUrl: PropTypes.string
}
