import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from '../styles/Profile.css'
import AdminSettingsForm from '../containers/AdminSettingsForm'

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

    return (
      <div className={ style.Profile }>
        <h3>User Settings</h3>
        <label htmlFor="userName">Name</label><br />
        <br />
        <input size="30" onChange={this.props.updateUserSettings}
               id="userName" name="name" type="text" value={this.props.user.name} />
        <br />
        <label htmlFor="email">Email</label><br />
        <br />
        <input size="30" onChange={this.props.updateUserSettings}
               id="email" name="email" type="email" value={this.props.user.email} />
        <br />
        Twitter Username: <a href={ 'https://twitter.com/' + this.props.user.twitterScreenName }>
          { this.props.user.twitterScreenName }
        </a>
        { adminSettings }
        <button className="save" onClick={this.props.saveAllSettings} disabled={disableSave}>Save</button>
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
