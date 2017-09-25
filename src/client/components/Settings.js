import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Keys from './Keys'
import textfield from '../styles/Textfield.css'

export default class Settings extends Component {

  componentDidMount() {
    this.props.getSettings()
  }

  render() {
    return (
      <div className={textfield.Textfield}>
        <p>Welcome! To use DocNow, you need to obtain a Consumer Key and Consumer Key from Twitter (learn more)</p>
        <Keys
          appKey={this.props.appKey}
          appSecret={this.props.appSecret}
          updateSettings={this.props.updateSettings}
        />
        <p>
          <button onClick={()=>{
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
    )
  }
}

Settings.propTypes = {
  appKey: PropTypes.string,
  appSecret: PropTypes.string,
  userLoggedIn: PropTypes.bool,
  getSettings: PropTypes.func,
  updateSettings: PropTypes.func,
  saveSettings: PropTypes.func,
  returnHome: PropTypes.func
}
