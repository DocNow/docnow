import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Tweet extends Component {
  render() {
    return (
      <div style={{borderBottom: '1px solid black'}}>
        <img src={this.props.data.user.avatarUrl} /> &nbsp;
        <strong>{this.props.data.user.screenName}</strong> <br/>
        <a href={this.props.data.link}>{this.props.data.created}</a> <br/>
        {this.props.data.text} <br/>
        <em>Replies: {this.props.data.replyCount}, Likes: {this.props.data.likeCount}, RTs: {this.props.data.retweetCount},</em>
      </div>
    )
  }
}

Tweet.propTypes = {
  data: PropTypes.object
}
