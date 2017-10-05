import React, { Component } from 'react'
import PropTypes from 'prop-types'
import User from './User'

import style from '../styles/Users.css'

export default class TweetList extends Component {

  render() {
    let loader = null
    if (this.props.users.length === 0) {
      loader = 'Loading...'
    }
    return (
      <div className={ style.UsersCard }>
        {loader}
        {this.props.users.map(user => (
          <User key={user.handle} data={user}/>
        ))}
      </div>
    )
  }
}

TweetList.propTypes = {
  users: PropTypes.array
}
