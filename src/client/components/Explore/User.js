import React, { Component } from 'react'
import PropTypes from 'prop-types'

import style from './User.css'


export default class User extends Component {

  addUser() {
    let screenName = this.props.data.screenName
    if (! screenName.startsWith('@')) {
      screenName = '@' + screenName
    }
    this.props.addSearchTerm({
      type: 'user',
      value: screenName
    })
  }

  viewTwitterUser(e) {
    e.stopPropagation()
    const url = 'https://twitter.com/' + this.props.data.screenName
    const win = window.open(url, '_new')
    win.focus()
  }

  render() {
    const accountLife = (new Date() - new Date(this.props.data.created)) / 1000 / 60 / 60
    const tweetsPerHour = (this.props.data.tweetsCount / accountLife).toFixed(2)

    return (
      <div className={style.User}>
        <div className={style.UserProfile}>
          <img onClick={() => {this.addUser()}} src={this.props.data.avatarUrl} />
          <div className={style.UserName}>
            {this.props.data.name}
          </div>
          &nbsp;
          <div className={style.UserHandle} onClick={(e) => {this.viewTwitterUser(e)}}>
            <a href={'https://twitter.com/' + this.props.data.screenName} target="_new">
              @{this.props.data.screenName}
            </a>
          </div>
        </div>
        <div className={style.TwitterUserStats}>
          <div className={style.Inline}>
            <b>{this.props.data.followersCount.toLocaleString()}</b> <br /> followers
          </div>
          <div className={style.Inline}>
            <b>{this.props.data.friendsCount.toLocaleString()}</b> <br /> following
          </div>
          <div className={style.Inline}>
            <b>{this.props.data.tweetsCount.toLocaleString()}</b> <br /> tweets
          </div>
          <div className={style.Inline}>
            <b>{tweetsPerHour}</b> <br /> tw/hr
          </div>
        </div>
        <p>{this.props.data.description}</p>
        <div>
          <a href={this.props.data.url} target="_new">
          <p>  {this.props.data.url}</p>
          </a>
        </div>
        <div className={style.UserStats}>
          <div className={style.Inline}>
            <b>{this.props.data.tweetsInSearch}</b> tweets in this collection
          </div>
        </div>
      </div>
    )
  }

}

User.propTypes = {
  data: PropTypes.object,
  addSearchTerm: PropTypes.func
}
