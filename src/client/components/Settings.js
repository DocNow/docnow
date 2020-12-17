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

          <div>
          <TextField
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
              id="appKey"
              name="appKey"
              label="Twitter App Consumer Key"
              helperText="Find this in your Twitter App settings"
              value={this.props.appKey}
              onChange={this.props.updateSettings} />
          </div> 

          <div>
            <TextField
              id="appSecret"
              name="appSecret"
              label="Twitter App Consumer Secret"
              helperText="Find this in your Twitter App settings"
              value={this.props.appSecret}
              onChange={this.props.updateSettings} />
          </div>

          <div>
            <TextField
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

        <div>

          <div className={style.SystemStats}>
            <dl>
              <dd>{this.props.tweetCount.toLocaleString()}</dd>
              <dt>Tweets</dt>
              <dd>{this.props.userCount.toLocaleString()}</dd>
              <dt>Instance Users</dt>
            </dl>
          </div>

          <div>
            <TextField
              id="instanceDescription"
              name="instanceDescription"
              label="Instance Desciption"
              helperText="A public statement of the purpose of this instance of DocNow"
              placeholder="This instance is being run by Centreville Public Library in order to collect and archive social media content relevant to the Centerville community."
              value={this.props.instanceDescription}
              multiline={true}
              rows={5}
              onChange={this.props.updateSettings} />
          </div>

          <div>
            <TextField
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
