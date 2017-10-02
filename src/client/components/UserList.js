import React, { Component } from 'react'
import PropTypes from 'prop-types'
import User from './User'

import style from '../styles/Users.css'

export default class TweetList extends Component {

  componentDidMount() {
    this.tick()
    this.timerId = setInterval(() => {
      this.tick()
    }, 3000)
  }

  componentWillUnmount() {
    clearInterval(this.timerId)
  }

  tick() {
    if (this.props.id) {
      this.props.getUsers(this.props.id)
    }
  }

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
  id: PropTypes.string,
  getUsers: PropTypes.func,
  users: PropTypes.array
}
