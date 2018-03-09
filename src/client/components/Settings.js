import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Keys from './Keys'
import style from './Settings.css'

export default class Settings extends Component {

  componentWillMount() {
    this.props.getSettings()
  }

  render() {

    let welcome = ''
    if (! this.props.appKey) {
      welcome = (
        <div>
          <h1>Welcome!</h1>
          <p>
            To setup DocNow, you will need to create a
            <em>Twitter application</em> and configure DocNow to use
            your <em>Consumer Key</em> and <em>Consumer Secret</em> keys
            from Twitter.
          </p>
          <p>
            Please visit <a href="https://apps.twitter.com">apps.twitter.com</a> to
            to create your application, and let us know if you
            have any difficulties at info@docnow.io.
          </p>
        </div>
      )
    }

    return (
      <div className={style.Settings}>
        {welcome}
        <Keys
          appKey={this.props.appKey}
          appSecret={this.props.appSecret}
          updateSettings={this.props.updateSettings} />
        <p>
          <button onClick={()=>{
            this.props.saveSettings().then(() => {
              if (this.props.userLoggedIn) {
                this.props.returnHome()
              } else {
                window.location = '/auth/twitter/'
              }
            })
          }}>Save</button>
        </p>
      </div>
    )
  }
}

Settings.propTypes = {
  appKey: PropTypes.string,
  appSecret: PropTypes.string,
  userLoggedIn: PropTypes.bool,
  getSettings: PropTypes.func,
  updateSettings: PropTypes.func,
  saveSettings: PropTypes.func,
  returnHome: PropTypes.func,
  isSuperUser: PropTypes.bool,
}
