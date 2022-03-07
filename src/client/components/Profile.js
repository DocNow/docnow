import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import style from './Profile.css'

export default class Profile extends Component {

  render() {

    const awaitingActivation = this.props.user.active ? ''
      : <p className={style.Inactive}>
          Your account is awaiting activation. In the meantime, you can explore
          and save searches, but you will not be able to activate your search and 
          collect live data from the Twitter stream. 
        </p>

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
              name="tweetQuota"
              label="Tweet Quota"
              disabled={! this.props.user.admin}
              onChange={this.props.updateUserSettings}
              value={this.props.user.tweetQuota || 25000} />
          </p>

          <p>
            I have read and acknowledge the&nbsp;
            <Link to="/terms/">Terms of Service</Link>&nbsp;
            <Checkbox 
              name="termsOfService"
              color="primary"
              onChange={this.props.updateUserSettings}
              checked={this.props.user.termsOfService || false} />
          </p>

          <p>
            <Button 
              color="primary"
              disabled={! this.props.user.formUpdated}
              variant="outlined"
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
  updateUserSettings: PropTypes.func,
  saveAllSettings: PropTypes.func,
}
