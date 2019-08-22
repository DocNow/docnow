import React, { Component } from 'react'
import PropTypes from 'prop-types'
import User from './User'

import exploreStyles from './Explore.css'
import animations from '../animations.css'

export default class UserList extends Component {

  render() {
    let loader = null
    if (this.props.users.length === 0) {
      loader = (<span className={`${animations.Spin} ${exploreStyles.Loader}`}>
          <ion-icon name="logo-ionic"></ion-icon>
        </span>)
    }
    return (
      <div className={ exploreStyles.InnerCard }>
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
