import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import style from './Header.css'

export default class Login extends Component {

  render() {
    if (this.props.twitterScreenName) {
      return (
        <div>
          <Link to="/profile/">
            <img
              title={ this.props.twitterScreenName }
              className={style.Avatar}
              src={ this.props.twitterAvatarUrl } />
          </Link>
          &nbsp;
          <a href="/auth/logout">Logout</a>
        </div>
      )
    } else {
      return (
        <div>
          <a href="/auth/twitter">Login</a>
        </div>
      )
    }
  }

}

Login.propTypes = {
  twitterScreenName: PropTypes.string,
  twitterAvatarUrl: PropTypes.string
}
