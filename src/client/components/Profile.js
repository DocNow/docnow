import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import style from './Profile.css'

export default class Profile extends Component {

  render() {
    let disableSave = true

    if (this.props.updatedSettings || this.props.updatedUserSettings) {
      disableSave = false
    }

    const tweetQuota = this.props.user.tweetQuota ? this.props.user.tweetQuota.toLocaleString() : ''

    const awaitingActivation = this.props.user.active ? ''
      : <p className={style.Inactive}>
          Your account is awaiting activation. In the meantime, you can explore
          and save searches, but you will not be able to activate your search and 
          collect live data from the Twitter stream. 
        </p>

      // Once we have emails in place, change text above to:
      // Your account is awaiting activation. The admin has been notified. 
      // You will receive an email when activated. etc.

    return (
      <div className={style.Profile}>

        {awaitingActivation}

        <form>

          <p className={style.TwitterInfo}>
            <a href={`https://twitter.com/${this.props.user.twitterScreenName}`}>
              <img 
                title={`Linked to Twitter as @${this.props.user.twitterScreenName}`}
                src={this.props.user.twitterAvatarUrl} />
            </a>
          </p>

          <p>
            <TextField
              name="name"
              label="Name"
              onChange={this.props.updateUserSettings}
              value={this.props.user.name} />
          </p>

          <p>
            <TextField
              name="email"
              label="Email"
              onChange={this.props.updateUserSettings}
              value={this.props.user.email} />
          </p>

          <p>
            <TextField
              name="quota"
              label="Tweet Quota"
              disabled={true}
              value={tweetQuota || 25000} />
          </p>

          <p>
            <Button 
              color="primary"
              variant="outlined"
              disabled={disableSave}
              onClick={this.props.saveAllSettings}>
              Save
            </Button>
          </p>

        </form>

      </div>
    )
  }
}

Profile.propTypes = {
  user: PropTypes.object,
  updatedSettings: PropTypes.bool,
  updatedUserSettings: PropTypes.bool,
  updateUserSettings: PropTypes.func,
  saveAllSettings: PropTypes.func,
}
