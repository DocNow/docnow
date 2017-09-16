import React, { Component } from 'react'
import PropTypes from 'prop-types'

import style from '../styles/Users.css'

export default class User extends Component {
  render() {
    return (
      <div className={style.Users}>
        <div className={style.UsersProfile}>
          <img src={this.props.data.avatarUrl} />
          <div className={style.UsersName}>
            {this.props.data.name}
          </div>
          <div>
            <a href={'https://twitter.com/' + this.props.data.screenName}>
              @{this.props.data.screenName}
            </a>
          </div>
        </div>
        <div className={style.Inline}>
          {this.props.data.followersCount} followers
        </div>
        <div className={style.Inline}>
          {this.props.data.friendsCount} following
        </div>
        <div className={style.Inline}>
          {this.props.data.tweetsCount} tweets
        </div>
        <div className={style.Inline}>
          {this.props.data.tweetsInSearch}
        </div>
        <hr />
        <p>{this.props.data.description}</p>
        <div className={style.Inline}>
          {this.props.data.url}
        </div>
      </div>
    )
  }
}

User.propTypes = {
  data: PropTypes.object
}
