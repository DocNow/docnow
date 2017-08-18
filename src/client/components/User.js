import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class User extends Component {
  render() {
    console.log(this.props.data)
    return (
      <div style={{borderBottom: '1px solid black'}}>
        <img src={this.props.data.avatarUrl} /> &nbsp;
        <strong>{this.props.data.screenName}</strong> @{this.props.data.handle}<br/>
        Matching: <strong>{this.props.data.matchingTweets}</strong><br/>
        <em>Tweets: {this.props.data.tweets}, Followers: {this.props.data.followers}, Following: {this.props.data.following},</em>
      </div>
    )
  }
}

User.propTypes = {
  data: PropTypes.object
}
