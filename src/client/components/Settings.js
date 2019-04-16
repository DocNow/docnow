import React from 'react'
import PropTypes from 'prop-types'
import style from './Settings.css'

import LogoUpload from './LogoUpload'
import MediaQueryComponent from '../components/MediaQueryComponent'

export default class Settings extends MediaQueryComponent {

  componentWillMount() {
    this.props.getSettings()
    this.props.getSystemStats()
  }

  componentDidMount() {
    this.setMediaQuery('(max-width: 780px)', style.Settings, style.SettingsUnder780px)
  }

  render() {

    let welcome = ''
    if (! this.props.appKey && ! this.props.appSecret) {
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
      <div className={this.state.mediaStyle}>

        {welcome}

        <div className={style.SystemSettings}>

          <p>
            <input onChange={this.props.updateSettings}
               id="instanceTitle"
               name="instanceTitle"
               type="text"
               placeholder="My Community Group"
               value={this.props.instanceTitle} />
            <br />
            <label htmlFor="instanceTitle">Instance Name</label>
          </p>

          <LogoUpload
            logoUrl={this.props.logoUrl}
            updateSettings={this.props.updateSettings} />

          <p>
            <input onChange={this.props.updateSettings}
              id="appKey"
              name="appKey"
              type="text"
              value={this.props.appKey} />
            <br />
            <label htmlFor="appKey">Consumer Key</label>
          </p>

          <p>
            <input
              onChange={this.props.updateSettings}
              id="appSecret"
              name="appSecret"
              type="text"
              value={this.props.appSecret} />
            <br />
            <label htmlFor="appSecret">Consumer Secret</label>
          </p>

          <p>
            <button onClick={() => {
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

        <div className={style.SystemStats}>
          <dl>
            <dd>{this.props.tweetCount.toLocaleString()}</dd>
            <dt>Tweets</dt>

            <dd>{this.props.twitterUserCount.toLocaleString()}</dd>
            <dt>Twitter Users</dt>

            <dd>{this.props.userCount.toLocaleString()}</dd>
            <dt>Instance Users</dt>
          </dl>
        </div>

      </div>
    )
  }
}

Settings.propTypes = {
  instanceTitle: PropTypes.string,
  logoUrl: PropTypes.string,
  appKey: PropTypes.string,
  appSecret: PropTypes.string,
  userLoggedIn: PropTypes.bool,
  isSuperUser: PropTypes.bool,
  tweetCount: PropTypes.number,
  twitterUserCount: PropTypes.number,
  userCount: PropTypes.number,

  getSettings: PropTypes.func,
  updateSettings: PropTypes.func,
  saveSettings: PropTypes.func,
  returnHome: PropTypes.func,
  getSystemStats: PropTypes.func
}
