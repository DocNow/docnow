import React, { Component } from 'react'
import { Link } from 'react-router-dom'

export default class Login extends Component {

  constructor() {
    super()
    this.state = {user: null, loaded: false}
  }

  componentWillMount() {
    this.getUser()
  }

  getUser() {
    fetch('/api/v1/user', {credentials: 'include'})
      .then(resp => resp.json())
      .then(result => {
        this.setState({user: result, loaded: true})
      })
  }

  render() {
    if (! this.state.loaded) {
      return null
    } else if (this.state.user.username) {
      return (
        <div>
          <img title={ this.state.username } id="avatar" src={ this.state.user.twitter_avatar_url } /> &nbsp; <a href="/accounts/logout">Logout</a>
        </div>
      )
    } else {
      return (
        <div>
          <a href="/accounts/login/">Login</a> &nbsp;
          <a href="/accounts/signup/">Signup</a> &nbsp;
          <Link to="/settings/">Settings</Link>
        </div>
      )
    }
  }

}
