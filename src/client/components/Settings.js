import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './Settings.css'

export default class Settings extends Component {

  componentDidMount() {
    this.props.getSettings()
  }

  render() {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          this.props.saveSettings()
        }}
        className={style.Settings}>
        <p>
          <label htmlFor="appKey">Application Key: </label><br />
          <br />
          <input size="30" onChange={this.props.updateSettings}
                 id="appKey" name="appKey" type="text" value={this.props.appKey} />
        </p>
        <p>
          <label htmlFor="appSecret">Application Secret: </label><br />
          <br />
          <input size="60" onChange={this.props.updateSettings}
                 id="appSecret" name="appSecret" type="text" value={this.props.appSecret} />
        </p>
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
  getSettings: PropTypes.func,
  updateSettings: PropTypes.func,
  saveSettings: PropTypes.func
}
