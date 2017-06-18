import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import { push } from 'react-router-redux'
import store from '../store'

import Header from '../components/Header'
import TrendsPage from './TrendsPage'
import SettingsPage from './SettingsPage'
import './App.css'

export default class App extends Component {

  componentDidMount() {
    fetch('/api/v1/setup')
      .then(resp => resp.json())
      .then(result => {
        if (! result) { store.dispatch(push('/settings/')) }
      })
  }

  render() {
    return (
      <div>
        <Header />
        <main>
          <Route exact path="/" component={TrendsPage} />
          <Route exact path="/settings/" component={SettingsPage} />
        </main>
      </div>
    )
  }
}
