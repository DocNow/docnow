import React from 'react'
import MediaQueryComponent from '../../client/components/MediaQueryComponent'
import { HashRouter as Router, Route } from "react-router-dom"
import Header from './Header'
import InsightsBody from '../../client/components/Insights/InsightsBody'
import Tweets from './Tweets'
import UsersBody from '../../client/components/Insights/UsersBody'
import ImagesBody from '../../client/components/Insights/ImagesBody'
import VideosBody from '../../client/components/Insights/VideosBody'
import WebpagesBody from '../../client/components/Insights/ActionsBody'
import ActionsBody from '../../client/components/Insights/ActionsBody'

import styles from '../../client/containers/App.css'

const search = window.searchData

class App extends MediaQueryComponent {
  constructor(props) {
    super(props)
    // The Tweets Insights expects only 100 tweets at a time.
    this.state = {
      ti_page: 0,
      ui_tweets: [],
      ii_tweets: [],
      vi_tweets: [],
      wi_tweets: [],
      users: search.users.slice(0, 100),
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

  getUsers(searchId, total) {
    this.setState({
      users: search.users.slice(0, total),
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
            <Route exact name="home" path="/" component={() => (
              <div>{header} <InsightsBody
                searchId={search.id}
                search={search}
                webpages={search.webpages}
              /> </div>)} />
            <Route exact name="tweets" path="/search/:searchId/tweets/" component={() => (
              <div>{header} <Tweets
                tweets={search.tweets}
                tweetCount={search.tweetCount}
              /> </div>)} />
            <Route exact name="users" path="/search/:searchId/users/" component={() => (
              <div>{header} <UsersBody
                searchId={search.id}
                users={this.state.users}
                userCount={search.userCount}
                getUsers={(s, o) => this.getUsers(s, o)}
                getTweetsForUser={(s, u) => this.getTweetsForUser(s, u)}
                resetTweets={() => {this.setState({ui_tweets: []})}}
                tweets={this.state.ui_tweets}
              /> </div>)} />
            <Route exact name="images" path="/search/:searchId/images/" component={() => (
              <div>{header} <ImagesBody
                searchId={search.id}
                search={search}
                getTweetsForImage={(s, u) => this.getTweetsForImage(s, u)}
                resetTweets={() => {this.setState({ii_tweets: []})}}
                tweets={this.state.ii_tweets}
              /> </div>)} />
            <Route exact name="videos" path="/search/:searchId/videos/" component={() => (
              <div>{header} <VideosBody
                searchId={search.id}
                search={search}
                getTweetsForVideo={(s, u) => this.getTweetsForVideo(s, u)}
                resetTweets={() => {this.setState({vi_tweets: []})}}
                tweets={this.state.vi_tweets}
              /> </div>)} />
            <Route exact name="webpages" path="/search/:searchId/webpages/" component={() => (
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
            <Route exact name="actions" path="/search/:searchId/actions/" component={() => (
              <div>{header} <ActionsBody
                searchId={search.id}
                search={search}
              /> </div>)} />
          </Router>
        </main>
      </div>
    )
  }
}

export default App