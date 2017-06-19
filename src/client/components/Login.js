import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { getUser } from '../actions/settings'
import store from '../store'

export default class Login extends Component {

  // <img title={ this.props.username } id="avatar" src={ this.props.avatar_url } /> &nbsp;

  componentWillMount() {
    store.dispatch(getUser())
  }

  render() {
    if (this.props.username) {
      return (
        <div>
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
  username: PropTypes.string
}
