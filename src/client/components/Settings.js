import React from 'react'
import PropTypes from 'prop-types'
import style from './Settings.css'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

import LogoUpload from './LogoUpload'
import MediaQueryComponent from '../components/MediaQueryComponent'

function Error({message, callbackUrl}) {
  if (message) {
    let description = message
    if (message.match(/Could not authenticate/)) {
      description = (
        <div>
          <p>Eek, it looks like you have an error with your keys!</p>
          <p>
            Please make sure you are copying and pasting the 
            <em>API key</em> and <em>API key secret</em> correctly 
            from the Twitter Developer Dashboard. 
          </p>
        </div>
      )
    } else if (message.match(/Desktop applications/)) {
      description = (
        <div>
          <p>Whoops, it looks like 3-Legged oAuth is not enabled.</p>
          <p>
            Please go to your app page 
            at <a href="https://developer.twitter.com">developer.twitter.com</a> and 
            edit your <em>Authentication Settings</em> to enable it.
          </p>
        </div>
      )
    } else if (message.match(/Callback URL/)) {
      description = (
        <div>
          <p>Sorry, it looks like the <em>Callback URL</em> has not been set correctly.</p>
          <p>Please go to your app page 
            at <a href="https://developer.twitter.com">developer.twitter.com</a> and 
            add <em>{callbackUrl}</em> to the <em>Callback URLs</em> in 
            the <em>Authentication settings</em> section.
          </p>
        </div>
      )
    } 
    return (
      <div className={style.Error}>
        {description}
      </div>
    )
  } else {
    return ''
  }
}

export default class Settings extends MediaQueryComponent {

  componentWillMount() {
    this.props.getSettings()
    this.props.getSystemStats()
  }

  componentDidMount() {
    this.setMediaQuery('(max-width: 780px)', style.Settings, style.SettingsUnder780px)
  }

  render() {

    // If there isn't a user provide a welcome message to the first user
    // who is presumed to be the admin. When the key handshake with Twitter
    // fails the user will be redirected to /settings/ with the error query
    // parameter set to the message.
    
    let welcome = ''
    if (! this.props.userLoggedIn) {
      const q = new URLSearchParams(window.location.search)

      const callbackUrl = `${window.location.protocol}//${window.location.hostname}/auth/twitter/callback`
      const error = <Error message={q.get('error')} callbackUrl={callbackUrl} />

      welcome = (
        <div className={style.Welcome}>
          <b>Welcome!</b>
          <p>
            To setup DocNow, you will need to visit the 
            <a href="https://developer.twitter.com/en/portal/">Twitter Developer Portal</a> and 
            create a <em>Twitter application</em>. This is required because you will 
            need to enter your <em>Application key</em> and <em>Application key secret</em> below.
          </p>
          <ol>
            <li>Set your <em>Description</em> to something that describes your DocNow instance for users who are logging in.</li>
            <li>In <em>Authentication Settings</em> please make sure that <em>3-Legged oAuth</em> is enabled.</li>
            <li>Set a callback URL of <em>{callbackUrl}</em></li>
          </ol>
          {error}
        </div>
      )
    }

    return (
      <div className={this.state.mediaStyle}>

        <div className={style.Settings}>

          {welcome}

          <div>
            <TextField
              variant="outlined"
              id="instanceTitle"
              name="instanceTitle"
              label="Instance Name"
              helperText="A name to identify your DocNow instance."
              placeholder="My Community Group"
              value={this.props.instanceTitle}
              onChange={this.props.updateSettings} />
          </div>

          <div>
            <TextField
              variant="outlined"
              id="instanceInfoLink"
              name="instanceInfoLink"
              label="More Information Link"
              helperText="A URL where users can learn more about you."
              placeholder="https://example.org"
              value={this.props.instanceInfoLink}
              onChange={this.props.updateSettings} /> 
          </div>

          <div>
            <TextField
              variant="outlined"
              id="instanceDescription"
              name="instanceDescription"
              label="Instance Description"
              helperText="A public statement of the purpose of this instance of DocNow"
              placeholder="This instance is being run by Centreville Public Library in order to collect and archive social media content relevant to the Centerville community."
              value={this.props.instanceDescription}
              multiline={true}
              rows={5}
              onChange={this.props.updateSettings} />
          </div>

          <div>
            <TextField
              variant="outlined"
              id="instanceTweetText"
              name="instanceTweetText"
              label="Notification Tweet"
              multiline={true}
              rows={5}
              helperText="A status message to send when announcing new data collection."
              placeholder="Centerville Public Library is collecting {query}. To learn more click on the link below."
              value={this.props.instanceTweetText}
              onChange={this.props.updateSettings} />
          </div>

          <div>
            <TextField
              variant="outlined"
              id="appKey"
              name="appKey"
              label="Twitter App Consumer Key"
              helperText="Find this in your Twitter App settings"
              value={this.props.appKey}
              onChange={this.props.updateSettings} />
          </div> 

          <div>
            <TextField
              variant="outlined"
              id="appSecret"
              name="appSecret"
              label="Twitter App Consumer Secret"
              helperText="Find this in your Twitter App settings"
              value={this.props.appSecret}
              onChange={this.props.updateSettings} />
          </div>

          <div>
            <TextField
              variant="outlined"
              id="defaultQuota"
              name="defaultQuota"
              label="Default Quota"
              helperText="Maximum tweets collected per user"
              defaultValue={50000}
              value={this.props.defaultQuota}
              onChange={this.props.updateSettings} />
          </div>

          <div>
            <LogoUpload
              logoUrl={this.props.logoUrl}
              updateSettings={this.props.updateSettings} />
          </div>

          <div>
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
          </div>

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
  userCount: PropTypes.number,
  getSettings: PropTypes.func,
  updateSettings: PropTypes.func,
  saveSettings: PropTypes.func,
  returnHome: PropTypes.func,
  getSystemStats: PropTypes.func
}
