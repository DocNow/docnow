import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import { push } from 'react-router-redux'
import store from '../store'

import Header from './Header'
import TrendsPage from './TrendsPage'
import SettingsPage from './SettingsPage'
import './App.css'

// import { connect } from 'react-redux'


class App extends Component {

  componentWillMount() {
    fetch('/api/v1/setup', {credentials: 'same-origin'})
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

// export default connect(null, null)(App)
export default App
