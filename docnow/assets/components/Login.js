import React, { Component } from 'react'
import './Login.css'

export default class Login extends Component {

  constructor() {
    console.log("hi")
    super();
    this.state = {user: null}
  }

  componentDidMount() {
    fetch('/api/v1/user')
      .then(resp => resp.json())
      .then(result => {
        this.setState({user: result})
      })
  }

  render() {
    var u = {} //this.state.user

    if (u.username) {
      return(
        <div> 
          { u.username }
        </div>
      )
    } else {
      return(
        <div>
          Login
        </div>
      )
    }
  }

}
