import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Tweet extends Component {
  render() {
    return (
      <div style={{borderBottom: '1px solid black'}}>
        <img src={this.props.data.avatarUrl} /> &nbsp;
        <strong>{this.props.data.screenName}</strong> <br/>
        <a href={this.props.data.link}>{this.props.data.date}</a> <br/>
        {this.props.data.text} <br/>
        <em>Replies: {this.props.data.replies}, Likes: {this.props.data.likes}, RTs: {this.props.data.retweets},</em>
      </div>
    )
  }
}

Tweet.propTypes = {
  data: PropTypes.object
}
