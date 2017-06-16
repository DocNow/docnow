import React, { Component } from 'react'
import style from './Settings.css'

class Settings extends Component {

  onSubmit(e) {
    e.preventDefault()
    console.log(e)
  }

  render() {
    return (
      <form onSubmit={this.onSubmit} className={style.Settings}>
        <p>
          <label htmlFor="app-key">Application Key: </label><br />
          <br />
          <input id="app-key" name="app-key" type="text" />
        </p>
        <p>
          <label htmlFor="app-secret">Application Secret: </label><br />
          <br />
          <input id="app-secret" name="app-secret" type="text"/ >
        </p>
        <p>
          <button>Save</button>
        </p>
      </form>
    )
  }
}

export default Settings
