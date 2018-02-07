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
            <b>{this.props.data.followersCount}</b> <br /> followers
          </div>
          <div className={style.Inline}>
            <b>{this.props.data.friendsCount}</b> <br /> following
          </div>
          <div className={style.Inline}>
            <b>{this.props.data.tweetsCount}</b> <br /> tweets
          </div>
        </div>
        <p>{this.props.data.description}</p>
        <div className={style.Inline}>
          <i className="fa fa-map-marker" aria-hidden="true" />
          &nbsp;
          {this.props.data.location}
        </div>
        <div className={style.Inline}>
          <a href={this.props.data.url} target="_new">
            {this.props.data.url}
          </a>
        </div>
        <div className={style.UserStats}>
          <div className={style.Inline}>
            <i className="fa fa-twitter" aria-hidden="true" />
            {this.props.data.tweetsInSearch}
          </div>
          <div className={style.Inline}>
            {tweetsPerHour} tw/hr
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
