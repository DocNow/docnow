import React, { Component } from 'react'
import './Login.css'

export default class Login extends Component {

  constructor() {
    super();
    this.state = {user: null}
  }

  componentWillMount() {
    this.getUser()
  }

  getUser() {
    fetch('/api/v1/user', {credentials: 'include'})
      .then(resp => resp.json())
      .then(result => {
        if (result.username) {
          this.setState({user: result})
        }
      })
  }

  render() {
    if (this.state.user) {
      return(
        <div> 
          { this.state.user.username } | <a href="/accounts/logout">Logout</a>
        </div>
      )
    } else {
      return(
        <div>
          <a href="/accounts/login/">Login</a> | <a href="/accounts/signup/">Signup</a>
        </div>
      )
    }
  }

}