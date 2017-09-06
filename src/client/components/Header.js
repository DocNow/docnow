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
    this.state = { headerStyle: styles.Header }
  }

  componentDidMount() {
    this.setMediaQuery('(max-width: 480px)', styles.Header, styles.HeaderUnder480px)
  }

  render() {
    let appBar = null
    let tabBar = null
    if (this.props.twitterScreenName && this.props.twitterAvatarUrl) {
      appBar = <AppBar />
      tabBar = <TabBar location={this.props.location}/>
    }

    return (
      <div>
        {appBar}
        <header className={this.state.mediaStyle}>
          <avatar><a href="http://docnow.io"><img src={dn}/></a></avatar>
          <logo><center><img src={mith}/></center></logo>
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
  location: PropTypes.string
}
