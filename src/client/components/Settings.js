import React from 'react'
import PropTypes from 'prop-types'
import style from './Settings.css'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

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

    // if there isn't a user provide a welcome message to the first user
    // who is presumed to be the admin.
    
    let welcome = ''
    if (! this.props.userLoggedIn) {
      welcome = (
        <div className={style.Welcome}>
          <br />
          <b>Welcome!</b>
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


        <div className={style.SystemSettings}>

          {welcome}

          <TextField
              id="instanceTitle"
              name="instanceTitle"
              label="Instance Name"
              helperText="A name to identify your DocNow instance."
              placeholder="My Community Group"
              value={this.props.instanceTitle}
              onChange={this.props.updateSettings} />

          <br />
      
          <TextField
            id="appKey"
            name="appKey"
            label="Twitter App Consumer Key"
            helperText="Find this in your Twitter App settings"
            value={this.props.appKey}
            onChange={this.props.updateSettings} />

          <br />

          <TextField
            id="appSecret"
            name="appSecret"
            label="Twitter App Consumer Secret"
            helperText="Find this in your Twitter App settings"
            value={this.props.appSecret}
            onChange={this.props.updateSettings} />

          <br />

          <TextField
            id="defaultQuota"
            name="defaultQuota"
            label="Default Quota"
            helperText="Maximum tweets collected per user"
            placeholder={50000}
            value={this.props.defaultQuota}
            onChange={this.props.updateSettings} />

          <br />

          <LogoUpload
            logoUrl={this.props.logoUrl}
            updateSettings={this.props.updateSettings} />

          <br />

          <Button 
            variant="outlined"
            color="primary"
            onClick={() => {
              this.props.saveSettings().then(() => {
                if (this.props.userLoggedIn) {
                  this.props.returnHome()
                } else {
                  window.location = '/auth/twitter/'
                }
              })
            }}>Save</Button>
          
          <br />
          <br />
          <br />
          <br />

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
  defaultQuota: PropTypes.number,
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
