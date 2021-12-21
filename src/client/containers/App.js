import React from 'react'
import MediaQueryComponent from '../components/MediaQueryComponent'
import Message from './Message'
import { Route, Switch } from 'react-router'
import { push } from 'connected-react-router'
import store from '../store'

import ScrollToTop from '../components/ScrollToTop'
import Header from './Header'
import TrendsPage from './TrendsPage'
import SettingsPage from './SettingsPage'
import ProfilePage from './ProfilePage'
import SearchPage from './SearchPage'
import InsightsPage from './InsightsPage'
import UsersPage from './UsersPage'
import TweetsPage from './TweetsPage'
import WebpagesPage from './WebpagesPage'
import ImagesPage from './ImagesPage'
import VideosPage from './VideosPage'
import SearchListPage from './SearchListPage'
import UserListPage from './UserListPage'
import ActionsPage from './ActionsPage'
import CollectionListPage from './CollectionListPage'
import CollectionPage from './CollectionPage'
import { getUser } from '../actions/user'
import { getSettings } from '../actions/settings'
import { getWorld } from '../actions/trends'
import { getSearches } from '../actions/searches'

import styles from './App.css'

class App extends MediaQueryComponent {

  constructor(props) {
    super(props)
    this.state = { headerStyle: styles.Header }
  }

  componentWillMount() {
    store.dispatch(getSettings())
    store.dispatch(getUser())
    store.dispatch(getWorld())
    store.dispatch(getSearches())
    fetch('/api/v1/setup', {credentials: 'same-origin'})
      .then(resp => resp.json())
      .then(result => {
        if (! result) { store.dispatch(push('/settings/')) }
      })
    console.log(store.getState())
  }

  componentDidMount() {
    this.setMediaQuery('(max-width: 780px)', styles.App, styles.AppUnder780px)
  }

  render() {
    return (
      <div id="App" className={this.state.mediaStyle}>
        <Header />
        <main>
          <ScrollToTop>
            <Switch>
              <Route exact name="trends" path="/" component={TrendsPage} />
              <Route exact name="settings" path="/settings/" component={SettingsPage} />
              <Route exact name="profile" path="/profile/" component={ProfilePage} />
              <Route exact name="explore" path="/explore/" component={SearchPage} />
              <Route exact name="searches" path="/searches/:userId?" component={SearchListPage} />
              <Route exact name="users" path="/users/" component={UserListPage} />
              <Route exact name="insights" path="/search/:searchId/" component={InsightsPage} />
              <Route exact name="insightsUsers" path="/search/:searchId/users/" component={UsersPage} />
              <Route exact name="tweets" path="/search/:searchId/tweets/" component={TweetsPage} />
              <Route exact name="webpages" path="/search/:searchId/webpages/" component={WebpagesPage} />
              <Route exact name="images" path="/search/:searchId/images/" component={ImagesPage} />
              <Route exact name="videos" path="/search/:searchId/videos/" component={VideosPage} />
              <Route exact name="actions" path="/search/:searchId/actions/" component={ActionsPage} />
              <Route exact name="collections" path="/collections/" component={CollectionListPage} />
              <Route exact name="collection" path="/collection/:searchId/" component={CollectionPage} />
            </Switch>
          </ScrollToTop>
          <Message />
        </main>
      </div>
    )
  }
}

export default App
