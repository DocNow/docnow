import React from 'react'
import MediaQueryComponent from '../MediaQueryComponent'
import { HashRouter as Router, Route } from "react-router-dom"
import InsightsBody from '../Insights/InsightsBody'
import TweetsBody from '../Insights/TweetsBody'
import UsersBody from '../Insights/UsersBody'
import ImagesBody from '../Insights/ImagesBody'
import VideosBody from '../Insights/VideosBody'

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
      ui_tweets: [],
      ii_tweets: [],
      vi_tweets: []
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

  makeModalData(tweet) {
    // Structure data from tweet into a minimal object for TweetsModal
    const userInfo = {
      avatarUrl: tweet.user.avatarUrl,
      screenName: tweet.user.screenName,
      name: tweet.user.name
    }
    return {
      id: tweet.id,
      user: userInfo,
      retweet: tweet.retweet
    }
  }

  getTweetsForUser(searchId, user) {
    // Locate tweets belonging to user (screenName), add them to ui_tweets
    const tweetsForUser = search.tweets.reduce((tweets, tweet) => {
      if (tweet.user.screenName === user) {
        tweets.push(
          this.makeModalData(tweet)
        )
      }
      return tweets
    }, [])
    this.setState({ui_tweets: tweetsForUser})
  }

  getTweetsForImage(searchId, url) {
    // Locate tweets with image url, add them to ii_tweets
    const tweetsForImg = search.tweets.reduce((tweets, tweet) => {
      if (tweet.images.indexOf(url) !== -1) {
        tweets.push(
          this.makeModalData(tweet)
        )
      }
      return tweets
    }, [])
    this.setState({ii_tweets: tweetsForImg})
  }

  getTweetsForVideo(searchId, url) {
    // Locate tweets with image url, add them to ii_tweets
    const tweetsForVid = search.tweets.reduce((tweets, tweet) => {
      if (tweet.videos.indexOf(url) !== -1) {
        tweets.push(
          this.makeModalData(tweet)
        )
      }
      return tweets
    }, [])
    this.setState({vi_tweets: tweetsForVid})
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
            <Route exact name="tweets" path="/search/:searchId/images/" component={() => <ImagesBody
                searchId={search.id}
                search={search}
                getTweetsForImage={(s, u) => this.getTweetsForImage(s, u)}
                resetTweets={() => {this.setState({ii_tweets: []})}}
                tweets={this.state.ii_tweets}
              />} />
            <Route exact name="tweets" path="/search/:searchId/videos/" component={() => <VideosBody
                searchId={search.id}
                search={search}
                getTweetsForVideo={(s, u) => this.getTweetsForVideo(s, u)}
                resetTweets={() => {this.setState({vi_tweets: []})}}
                tweets={this.state.vi_tweets}
              />} />
          </Router>
        </main>
      </div>
    )
  }
}

export default App
