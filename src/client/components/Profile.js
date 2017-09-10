import React, { Component } from 'react'
import PropTypes from 'prop-types'
import introStyles from '../styles/Intro.css'
import globStyles from '../styles/App.css'
import tfStyles from '../styles/Textfield.css'
import button from '../styles/Button.css'
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
    adminSettings
    disableSave

    return (
      <div>
      <div className={globStyles.Container}>
        <div className={introStyles.IntroP}>You are logged in with Twitter as @{this.props.user.twitterScreenName}. <a href="/auth/logout">Disconnect.</a></div>
      </div>
      <div className={globStyles.Container}>
            <textfield className={tfStyles.Textfield}>
              <h2>Settings</h2>
              <label htmlFor="userName">Your Name:</label>
              <input type="text" id="userName" name="name" placeholder=""
                onChange={this.props.updateUserSettings} value={this.props.user.name}/>
              <label htmlFor="email">Email:</label>
              <input placeholder="" id="email" name="email" type="email"
                onChange={this.props.updateUserSettings} value={this.props.user.email}/>

              { adminSettings }

              <div><button onClick={this.props.saveAllSettings} disabled={disableSave}
                className={button.Button} type="button">Save Settings</button></div>
            </textfield>
      </div>
      </div>
    )
  }
}

// <div className={ style.Profile }>
//   <h3>User Settings</h3>
//   <label htmlFor="userName">Name</label><br />
//   <br />
//   <input size="30" onChange={this.props.updateUserSettings}
//          id="userName" name="name" type="text" value={this.props.user.name} />
//   <br />
//   <label htmlFor="email">Email</label><br />
//   <br />
//   <input size="30" onChange={this.props.updateUserSettings}
//          id="email" name="email" type="email" value={this.props.user.email} />
//   <br />
//   Twitter Username: <a href={ 'https://twitter.com/' + this.props.user.twitterScreenName }>
//     { this.props.user.twitterScreenName }
//   </a>
//   { adminSettings }
//   <button className="save" onClick={this.props.saveAllSettings} disabled={disableSave}>Save</button>
// </div>

Profile.propTypes = {
  user: PropTypes.object,
  updatedSettings: PropTypes.bool,
  updatedUserSettings: PropTypes.bool,
  updateUserSettings: PropTypes.func,
  saveAllSettings: PropTypes.func,
}
