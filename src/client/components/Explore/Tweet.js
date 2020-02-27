import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import style from './Tweet.css'

export default class Tweet extends Component {
  render() {
    const created = moment(this.props.data.created).fromNow()
    return (
      <div className={style.Tweet}>
        <div className={style.TweetProfile}>
          <img src={this.props.data.user.avatarUrl} />
          <div className={style.TweetName}>{this.props.data.user.name}</div>
          <div>
              @{ this.props.data.user.screenName}
          </div>
        </div>
        <div className={style.TweetTime}>
          <a href={this.props.data.twitterUrl}>{created}</a>
        </div>
        <p>{this.props.data.text}</p>
        <div className={style.TweetStats}>
          <div className={style.Inline}>
            <ion-icon name="repeat"></ion-icon>&nbsp;
            {this.props.data.retweetCount}
          </div>
          <div className={style.Inline}>
            <ion-icon name="heart-empty"></ion-icon>&nbsp;
            {this.props.data.likeCount}
          </div>
        </div>
      </div>
    )
  }
}

Tweet.propTypes = {
  data: PropTypes.object
}
