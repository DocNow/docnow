import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import SearchInfo from './SearchInfo'
import TweetEmbed from 'react-tweet-embed'
import TweetTabBar from './TweetTabBar'

import card from '../Card.css'
import style from './Insights.css'

export default class Insights extends Component {

  componentDidMount() {
    this.props.resetTwitterSearch()
    this.tick()
    this.props.getUsers(this.props.searchId)
    this.props.getTweets(this.props.searchId)
    this.props.getImages(this.props.searchId)
    this.props.getVideos(this.props.searchId)
    this.props.getWebpages(this.props.searchId)
    this.timerId = setInterval(() => {
      this.tick()
    }, 3000)
  }

  componentWillUnmount() {
    clearInterval(this.timerId)
    this.props.resetTwitterSearch()
  }

  tick() {
    this.props.getSearch(this.props.searchId)
  }

  render() {

    // don't render until we at least know the title of the search
    if (! this.props.search.title) {
      return <div />
    }

    let webpageImageUrl = ''
    if (this.props.webpages.length > 0) {
      webpageImageUrl = this.props.webpages[0].image
    }

    let imageUrl = ''
    if (this.props.search.images.length > 0) {
      imageUrl = this.props.search.images[0].url
    }

    let videoUrl = ''
    if (this.props.search.videos.length > 0) {
      videoUrl = this.props.search.videos[0].url
    }

    let tweetIds = []
    if (this.props.search.tweets.length > 0) {
      tweetIds = this.props.search.tweets.map((t) => {return t.id})
    }

    return (
      <div className={style.Insights}>

        <SearchInfo
          title={this.props.search.title}
          description={this.props.search.description}
          search={this.props.search}
          searches={this.props.searches}
          user={this.props.user}
          updateSearch={this.props.updateSearch}
          createArchive={this.props.createArchive} />

        <TweetTabBar />

        <div className={card.CardHolder}>
          <div className={card.SavedShortCard}>
            <h1><a href="/">{this.props.search.userCount.toLocaleString()}<br />users</a></h1>
          </div>
          <div className={card.SavedLongCard}>
           {this.props.search.users.slice(0, 78).map((u) => {
             return (
               <a key={u.screenName} href={`https://twitter.com/${u.screenName}`} target="_new">
                 <img title={`${u.screenName} sent ${u.tweetsInSearch} tweets`} src={u.avatarUrl} />
               </a>
             )
           })}
          </div>
        </div>

        <div className={card.CardHolder}>
          <div className={card.SavedShortCard}>
            <h1>
              <Link to={`/search/${this.props.searchId}/tweets/`}>
                {parseInt(this.props.search.tweetCount, 10).toLocaleString()}
                <br />
                tweets
              </Link>
            </h1>
          </div>
          <div className={card.SavedLongCard}>
            <TweetEmbed
              id={tweetIds[0]}
              options={{cards: 'hidden'}} />
          </div>
        </div>

        <div className={card.CardHolder}>
          <div className={card.SavedImageCard}>
            <img src={webpageImageUrl} />
            <h1>
              <Link to={`/search/${this.props.searchId}/webpages/`}>
                {parseInt(this.props.search.urlCount, 10).toLocaleString()}
                <br />
                Webpages
              </Link>
            </h1>
          </div>
          <div className={card.SavedImageCard}>
            <img src={imageUrl} />
            <h1>
              <Link to={`/search/${this.props.searchId}/images/`}>
                {parseInt(this.props.search.imageCount, 10).toLocaleString()}
                <br />
                Images
              </Link>
            </h1>
          </div>
          <div className={card.SavedImageCard}>
            <video src={videoUrl} />
            <h1>
              <Link to={`/search/${this.props.searchId}/videos/`}>
                {parseInt(this.props.search.videoCount, 10).toLocaleString()}
                <br />
                Videos
              </Link>
            </h1>
          </div>
        </div>


      </div>
    )
  }
}

Insights.propTypes = {
  searchId: PropTypes.string,
  search: PropTypes.object,
  searches: PropTypes.array,
  user: PropTypes.object,
  webpages: PropTypes.array,
  getSearch: PropTypes.func,
  getTweets: PropTypes.func,
  getUsers: PropTypes.func,
  getVideos: PropTypes.func,
  getImages: PropTypes.func,
  getWebpages: PropTypes.func,
  resetTwitterSearch: PropTypes.func,
  updateSearch: PropTypes.func,
  createArchive: PropTypes.func
}
