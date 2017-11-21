import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import style from '../styles/Tweets.css'

export default class Tweet extends Component {
  render() {
    const created = moment(this.props.data.created).fromNow()
    return (
      <div className={style.Tweets}>
        <div className={style.TweetsProfile}>
          <img src={this.props.data.user.avatarUrl} />
          <div className={style.TweetsName}>{this.props.data.user.name}</div>
          <div>
            <a href={'https://twitter.com/' + this.props.data.user.screenName }>
              @{ this.props.data.user.screenName}
            </a>
          </div>
          <hr />
          <a href={this.props.data.twitterUrl}>{created}</a>
        </div>
        <hr />
        <p>{this.props.data.text}</p>
        <div className={style.Inline}><i className="fa fa-comment-o" />{this.props.data.replyCount}</div>
        <div className={style.Inline}><i className="fa fa-retweet" />{this.props.data.retweetCount}</div>
        <div className={style.Inline}><i className="fa fa-heart-o" />{this.props.data.likeCount}</div>
      </div>
    )
  }
}

Tweet.propTypes = {
  data: PropTypes.object
}
