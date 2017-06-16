import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import Header from '../components/Header'
import TrendsPage from './TrendsPage'
import SettingsPage from './SettingsPage'
import './App.css'

export default class App extends Component {
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
