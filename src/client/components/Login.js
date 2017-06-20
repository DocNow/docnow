import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { getUser } from '../actions/settings'
import store from '../store'
import style from './Header.css'

export default class Login extends Component {

  componentWillMount() {
    store.dispatch(getUser())
  }

  render() {
    if (this.props.twitterScreenName) {
      return (
        <div>
          <img
            title={ this.props.twitterScreenName }
            className={style.Avatar}
            src={ this.props.twitterAvatarUrl } />
          &nbsp;
          <a href="/auth/logout">Logout</a>
        </div>
      )
    } else {
      return (
        <div>
          <a href="/auth/twitter">Login</a> &nbsp;
          <Link to="/settings/">Settings</Link>
        </div>
      )
    }
  }

}

Login.propTypes = {
  twitterScreenName: PropTypes.string,
  twitterAvatarUrl: PropTypes.string
}
