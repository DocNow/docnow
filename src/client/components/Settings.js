import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Keys from './Keys'
import style from '../styles/Settings.css'

export default class Settings extends Component {

  componentDidMount() {
    this.props.getSettings()
  }

  render() {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          this.props.saveSettings().then(() => {
            if (this.props.userLoggedIn) {
              this.props.returnHome()
            } else {
              window.location = '/auth/twitter/'
            }
          })
        }}
        className={style.Settings}>
        <p>Welcome! To use DocNow, you need to obtain a Consumer Key and Consumer Key from Twitter (learn more)</p>
        <Keys
          appKey={this.props.appKey}
          appSecret={this.props.appSecret}
          updateSettings={this.props.updateSettings}
        />
        <p>
          <button>Save</button>
        </p>
      </form>
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
