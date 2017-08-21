import React, { Component } from 'react'
import PropTypes from 'prop-types'
import style from './Search.css'
import User from './User'

export default class TweetList extends Component {

  componentDidUpdate() {
    if (this.props.endpoint && this.props.users.length === 0) {
      this.props.getUsers(this.props.endpoint)
    }
  }

  render() {
    let loader = null
    if (this.props.users.length === 0) {
      loader = 'Loading...'
    }
    return (
        <div className={ style.Box }>
          {loader}
          {this.props.users.map(user => (
            <User key={user.handle} data={user}/>
          ))}
        </div>
    )
  }
}

TweetList.propTypes = {
  endpoint: PropTypes.string,
  getUsers: PropTypes.func,
  users: PropTypes.array
}
