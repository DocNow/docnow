import React from 'react'
import MediaQueryComponent from '../MediaQueryComponent'
import { HashRouter as Router, Route } from "react-router-dom"
import InsightsBody from '../Insights/InsightsBody'
import TweetsBody from '../Insights/TweetsBody'
import UsersBody from '../Insights/UsersBody'

import search from './data'
import webpages from './webpages'

import styles from '../../containers/App.css'

class App extends MediaQueryComponent {
  constructor(props) {
    super(props)
    // The Tweets Insights expects only 100 tweets at a time.
    this.state = {
      ti_tweets: search.tweets.slice(0, 101),
      ti_page: 0,
      ui_tweets: []
    }
  }

  componentDidMount() {
    this.setMediaQuery('(max-width: 780px)', styles.App, styles.AppUnder780px)
  }

  getTweets(searchId, includeRetweets, offset, page) {
    this.setState({
      ti_tweets: search.tweets.slice(offset, offset + 101),
      ti_page: page
    })
  }

  getTweetsForUser(searchId, user) {
    // Locate tweets belonging to user (screenName), add ids to ui_tweets
    const tweetsForUser = search.tweets.reduce((tweets, tweet) => {
      if (tweet.user.screenName === user) {
        const userInfo = {
          avatarUrl: tweet.user.avatarUrl,
          screenName: user,
          name: tweet.user.name
        }
        const tweetForUser = {
          id: tweet.id,
          user: userInfo,
          retweet: tweet.retweet
        }
        tweets.push(tweetForUser)
      }
      return tweets
    }, [])
    this.setState({ui_tweets: tweetsForUser})
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
                tweets={this.state.ti_tweets}
                page={this.state.ti_page}
                tweetCount={search.tweetCount}
                searchId={search.id}
                getTweets={(s, i, o, p) => this.getTweets(s, i, o, p)}
              />} />
            <Route exact name="tweets" path="/search/:searchId/users/" component={() => <UsersBody
                searchId={search.id}
                search={search}
                getTweetsForUser={(s, u) => this.getTweetsForUser(s, u)}
                resetTweets={() => {this.setState({ui_tweets: []})}}
                tweets={this.state.ui_tweets}
              />} />
          </Router>
        </main>
      </div>
    )
  }
}

export default App
