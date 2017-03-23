import React, { Component } from 'react'
import './Header.css'
import dn from '../images/dn.png'

export default class Header extends Component {
  render() {
    return(
      <div id="header">
          <div id="logo"><a href="/"><img src={ dn } /></a></div>
          <div id="login"><Login /></div>
      </div>
    )
  }
}

class Login extends Component {

  constructor() {
    super();
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
      return(
        <div> 
          <img id="avatar" src={ this.state.user.avatar_url } /> | <a href="/accounts/logout">Logout</a>
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
