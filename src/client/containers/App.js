import React, { Component } from 'react'
import { Route, Link } from 'react-router-dom'
import Header from '../components/Header'
import TrendsPage from './TrendsPage'
import AppSettingsPage from './AppSettingsPage'
import './App.css'

export default class App extends Component {
  render() {
    return (
      <div>
        <Header />
        <main>
          <Route exact path="/" component={TrendsPage} />
          <Route exact path="/app" component={AppSettingsPage} />
          <Link to="/app">AppSettings</Link>
        </main>
      </div>
    )
  }
}
