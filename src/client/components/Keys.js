import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Keys extends Component {

  render() {
    return (
        <p>
          <label htmlFor="appKey">Consumer Key: </label><br />
          <br />
          <input size="30" onChange={this.props.updateSettings}
                 id="appKey" name="appKey" type="text" value={this.props.appKey} />
          <br />
          <label htmlFor="appSecret">Consumer Secret: </label><br />
          <br />
          <input size="60" onChange={this.props.updateSettings}
                 id="appSecret" name="appSecret" type="text" value={this.props.appSecret} />
        </p>
    )
  }
}

Keys.propTypes = {
  appKey: PropTypes.string,
  appSecret: PropTypes.string,
  updateSettings: PropTypes.func
}
