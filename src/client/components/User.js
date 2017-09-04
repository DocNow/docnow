import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class User extends Component {
  render() {
    return (
      <div style={{borderBottom: '1px solid black'}}>
        <img src={this.props.data.avatarUrl} /> &nbsp;
        <strong>{this.props.data.screenName}</strong> @{this.props.data.screenName}<br/>
        Matching: <strong>{this.props.data.tweetsInSearch}</strong><br/>
        <em>
        Tweets: {this.props.data.tweetsCount},
        Followers: {this.props.data.followersCount},
        Following: {this.props.data.friendsCount},
        </em>
      </div>
    )
  }
}

User.propTypes = {
  data: PropTypes.object
}
