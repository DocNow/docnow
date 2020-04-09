import React from 'react'
import MediaQueryComponent from '../MediaQueryComponent'
import { HashRouter as Router, Route } from "react-router-dom"
import InsightsBody from '../Insights/InsightsBody'
import TweetsBody from '../Insights/TweetsBody'
import Users from '../Insights/Users'

import search from './data'
import webpages from './webpages'

import styles from '../../containers/App.css'

class App extends MediaQueryComponent {
  constructor(props) {
    super(props)
    // The Tweets Insights expects only 100 tweets at a time.
    this.state = {
      tweets: search.tweets.slice(0, 101),
      page: 0
    }
  }

  componentDidMount() {
    this.setMediaQuery('(max-width: 780px)', styles.App, styles.AppUnder780px)
  }

  getTweets(searchId, includeRetweets, offset, page) {
    this.setState({
      tweets: search.tweets.slice(offset, offset + 101),
      page
    })
  }

  render() {
    return (
      <div id="App" className={this.state.mediaStyle}>
        <main>
          <Router>
            <Route exact name="trends" path="/" component={() => <InsightsBody
                searchId={search.id}
                search={search}
                webpages={webpages}
              />} />
            <Route exact name="tweets" path="/search/:searchId/tweets/" component={() => <TweetsBody
                tweets={this.state.tweets}
                page={this.state.page}
                tweetCount={search.tweetCount}
                searchId={search.id}
                getTweets={(s, i, o, p) => this.getTweets(s, i, o, p)}
              />} />
            <Route exact name="tweets" path="/search/:searchId/users/" component={() => <Users
                searchId={search.id}
                search={search}
                getUsers={() => search.users}
                getSearch={() => search}
                getTweetsForUser={() => 3}
                resetTweets={() => null}
                updateSearch={() => null}
                tweets={search.tweets}
                navigateTo={() => null}
              />} />
          </Router>
        </main>
      </div>
    )
  }
}

export default App
