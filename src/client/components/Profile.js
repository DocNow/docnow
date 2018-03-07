import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AdminSettingsForm from '../containers/AdminSettingsForm'

import style from './Profile.css'

export default class Profile extends Component {

  render() {
    let adminSettings = null
    let disableSave = true
    if (this.props.user.isSuperUser === 'true') {
      adminSettings = <AdminSettingsForm />
    }
    if (this.props.updatedSettings || this.props.updatedUserSettings) {
      disableSave = false
    }
    adminSettings
    disableSave

    return (
      <div className={style.Profile}>

        <p>
          You are logged in with Twitter as @{this.props.user.twitterScreenName}.
          <br />
          <button href="/auth/logout">Disconnect.</button>
        </p>

        <p>
          <label htmlFor="userName">Your Name:</label>&nbsp;
          <input type="text" id="userName" name="name" placeholder=""
            onChange={this.props.updateUserSettings} value={this.props.user.name}/>
        </p>

        <p>
          <label htmlFor="email">Email:</label>&nbsp;
          <input placeholder="" id="email" name="email" type="email"
            onChange={this.props.updateUserSettings} value={this.props.user.email}/>
        </p>

        { adminSettings }

        <div>
          <button
            type="button"
            onClick={this.props.saveAllSettings}
            disabled={disableSave}>
            Save Settings
          </button>
        </div>

      </div >
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
