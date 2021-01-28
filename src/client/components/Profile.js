import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import style from './Profile.css'

export default class Profile extends Component {

  render() {
    let disableSave = true

    if (this.props.updatedSettings || this.props.updatedUserSettings) {
      disableSave = false
    }

    return (
      <div className={style.Profile}>

        <form>

        <div className={style.TwitterInfo}>
          <a href={`https://twitter.com/${this.props.user.twitterScreenName}`}>
            <img 
              title={`Linked to Twitter as @${this.props.user.twitterScreenName}`}
              src={this.props.user.twitterAvatarUrl} />
          </a>
        </div>

        <div>
          <Typography variant="body1" gutterBottom>
            Your max tweet quota: {this.props.user.tweetQuota}
          </Typography>
        </div>

        <div>
          <TextField
            name="name"
            label="Name"
            onChange={this.props.updateUserSettings}
            value={this.props.user.name} />
        </div>

        <div>
          <TextField
            name="email"
            label="Email"
            onChange={this.props.updateUserSettings}
            value={this.props.user.email} />
        </div>

        <div>
          <Button 
            color="primary"
            variant="outlined"
            disabled={disableSave}
            onClick={this.props.saveAllSettings}>
            Save
          </Button>
        </div>

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
