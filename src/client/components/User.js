import React, { Component } from 'react'
import PropTypes from 'prop-types'

import style from '../styles/Users.css'


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
    const countHelper = this.props.data.screenName + ' has tweeted ' + this.props.data.tweetsInSearch + ' times in this search'
    return (
      <div onClick={() => {this.addUser()}} className={style.User}>
        <div className={style.UserProfile}>
          <img src={this.props.data.avatarUrl} />
          <div className={style.UserName}>
            {this.props.data.name}
          </div>
          &nbsp;
          <div className={style.UserHandle} onClick={(e) => {this.viewTwitterUser(e)}}>
            @{this.props.data.screenName}
          </div>
        </div>
        <div className={style.UserStats}>
          <div>
            <b>{this.props.data.followersCount}</b> <br /> followers
          </div>
          <div>
            <b>{this.props.data.friendsCount}</b> <br /> following
          </div>
          <div>
            <b>{this.props.data.tweetsCount}</b> <br /> tweets
          </div>
          <div className={style.UserCount}>
            <span alt={countHelper} title={countHelper}>
              {this.props.data.tweetsInSearch}
            </span>
          </div>
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
  data: PropTypes.object,
  addSearchTerm: PropTypes.func
}
