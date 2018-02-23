import React, { Component } from 'react'
import PropTypes from 'prop-types'
import User from './User'

import style from './UserList.css'

export default class UserList extends Component {

  render() {
    let loader = null
    if (this.props.users.length === 0) {
      loader = 'Loading...'
    }
    return (
      <div className={ style.UserList }>
        {loader}
        {this.props.users.map(user => {
          return (
            <User
              key={user.screenName}
              addSearchTerm={this.props.addSearchTerm}
              data={user}/>
          )
        })}
      </div>
    )
  }
}

UserList.propTypes = {
  users: PropTypes.array,
  addSearchTerm: PropTypes.func
}
