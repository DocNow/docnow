import React from 'react'
import MediaQueryComponent from '../../client/components/MediaQueryComponent'
import { HashRouter as Router, Route } from "react-router-dom"
import Header from './Header'
import InsightsBody from '../../client/components/Insights/InsightsBody'
import TweetsBody from '../../client/components/Insights/TweetsBody'
import UsersBody from '../../client/components/Insights/UsersBody'
import ImagesBody from '../../client/components/Insights/ImagesBody'
import VideosBody from '../../client/components/Insights/VideosBody'
import WebpagesBody from '../../client/components/Insights/WebpagesBody'

import styles from '../../client/containers/App.css'

const search = window.searchData
console.log(search)

class App extends MediaQueryComponent {
  constructor(props) {
    super(props)
    // The Tweets Insights expects only 100 tweets at a time.
    this.state = {
      ti_tweets: search.tweets.slice(0, 101),
      ti_page: 0,
      ui_tweets: [],
      ii_tweets: [],
      vi_tweets: [],
      wi_tweets: [],
      isHome: true
    }
  }

  componentDidMount() {
    this.setMediaQuery('(max-width: 780px)', styles.App, styles.AppUnder780px)
    if (window.location.hash.includes('#/search')) {
      this.setState({isHome: false})
    }
    window.onhashchange = (e) => {
      if (e.newURL.includes('#/search')) {
        this.setState({isHome: false})
      } else {
        this.setState({isHome: true})
      }
    }
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

  getTweetsForUrl(searchId, url) {
    // Locate tweets with image url, add them to ii_tweets
    const tweetsForUrl = search.tweets.reduce((tweets, tweet) => {
      if (tweet.urls.length > 0) {
        if (tweet.urls.filter((u) => u.long === url).length !== -1) {
          tweets.push(
            this.makeModalData(tweet)
          )
        }
      }
      return tweets
    }, [])
    this.setState({wi_tweets: tweetsForUrl})
  }

  render() {
    const header = <Header
        title={search.title}
        desc={search.description}
        creator={search.creator}
        searchQuery={search.query.map(q => q.value.or.map(t => t.value).join(' ')).join(' ')}
        startDate={search.startDate}
        endDate={search.endDate}
        isHome={this.state.isHome} />
    return (
      <div id="App" className={this.state.mediaStyle}>
        <main>
          <Router>
            <Route exact name="trends" path="/" component={() => (
              <div>{header} <InsightsBody
                searchId={search.id}
                search={search}
                webpages={search.webpages}
              /> </div>)} />
            <Route exact name="tweets" path="/search/:searchId/tweets/" component={() => (
              <div>{header} <TweetsBody
                tweets={this.state.ti_tweets}
                page={this.state.ti_page}
                tweetCount={search.tweetCount}
                searchId={search.id}
                getTweets={(s, i, o, p) => this.getTweets(s, i, o, p)}
              /> </div>)} />
            <Route exact name="tweets" path="/search/:searchId/users/" component={() => (
              <div>{header} <UsersBody
                searchId={search.id}
                search={search}
                getTweetsForUser={(s, u) => this.getTweetsForUser(s, u)}
                resetTweets={() => {this.setState({ui_tweets: []})}}
                tweets={this.state.ui_tweets}
              /> </div>)} />
            <Route exact name="tweets" path="/search/:searchId/images/" component={() => (
              <div>{header} <ImagesBody
                searchId={search.id}
                search={search}
                getTweetsForImage={(s, u) => this.getTweetsForImage(s, u)}
                resetTweets={() => {this.setState({ii_tweets: []})}}
                tweets={this.state.ii_tweets}
              /> </div>)} />
            <Route exact name="tweets" path="/search/:searchId/videos/" component={() => (
              <div>{header} <VideosBody
                searchId={search.id}
                search={search}
                getTweetsForVideo={(s, u) => this.getTweetsForVideo(s, u)}
                resetTweets={() => {this.setState({vi_tweets: []})}}
                tweets={this.state.vi_tweets}
              /> </div>)} />
              <Route exact name="tweets" path="/search/:searchId/webpages/" component={() => (
                <div>{header} <WebpagesBody
                  searchId={search.id}
                  search={search}
                  webpages={search.webpages}
                  getTweetsForUrl={(s, u) => this.getTweetsForUrl(s, u)}
                  resetTweets={() => {this.setState({wi_tweets: []})}}
                  tweets={this.state.wi_tweets}
                  selectWebpage={() => null}
                  deselectWebpage={() => null}
                  checkArchive={() => null}
                  saveArchive={() => null}
                /> </div>)} />
          </Router>
        </main>
      </div>
    )
  }
}

export default App