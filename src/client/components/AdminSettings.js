import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LogoUpload from './LogoUpload'
import Keys from './Keys'
// import style from '../styles/Settings.css'

export default class AdminSettings extends Component {
  render() {
    return (
      <div>
        <label htmlFor="instanceTitle">Instance Title</label>
        <input onChange={this.props.updateSettings}
               id="instanceTitle" name="instanceTitle" type="text" value={this.props.instanceTitle} />
        <LogoUpload
          logoUrl={this.props.logoUrl}
          updateSettings={this.props.updateSettings}/>
        <Keys
          appKey={this.props.appKey}
          appSecret={this.props.appSecret}
          updateSettings={this.props.updateSettings}
        />
      </div>
    )
  }
}

AdminSettings.propTypes = {
  user: PropTypes.object,
  appKey: PropTypes.string,
  appSecret: PropTypes.string,
  logoUrl: PropTypes.string,
  instanceTitle: PropTypes.string,
  saveSettings: PropTypes.func,
  updateSettings: PropTypes.func
}
