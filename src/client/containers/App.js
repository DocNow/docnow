import React from 'react'
import MediaQueryComponent from '../components/MediaQueryComponent'
import { Route } from 'react-router-dom'
import { push } from 'react-router-redux'
import store from '../store'

import Header from './Header'
import TrendsPage from './TrendsPage'
import SettingsPage from './SettingsPage'
import ProfilePage from './ProfilePage'
import SearchPage from './SearchPage'
import { getUser } from '../actions/user'
import { getSettings } from '../actions/settings'
import { getWorld } from '../actions/trends'

import styles from '../styles/App.css'

class App extends MediaQueryComponent {

  constructor(props) {
    super(props)
    this.state = { headerStyle: styles.header }
  }

  componentWillMount() {
    store.dispatch(getSettings())
    store.dispatch(getUser())
    store.dispatch(getWorld())
    fetch('/api/v1/setup', {credentials: 'same-origin'})
      .then(resp => resp.json())
      .then(result => {
        if (! result) { store.dispatch(push('/settings/')) }
      })
  }

  componentDidMount() {
    this.setMediaQuery('(max-width: 780px)', styles.app, styles.appUnder780px)
  }

  render() {
    return (
      <div className={this.state.mediaStyle}>
        <Header />
        <main>
          <Route exact path="/" component={TrendsPage} />
          <Route exact path="/settings/" component={SettingsPage} />
          <Route exact path="/profile/" component={ProfilePage} />
          <Route exact path="/search/:q" component={SearchPage} />
        </main>
      </div>
    )
  }
}

export default App
