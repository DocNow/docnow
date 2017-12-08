import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TweetList from './TweetList'
import UserList from './UserList'
import HashtagChart from './HashtagChart'
import UrlList from './UrlList'
import ImageList from './ImageList'
import VideoList from './VideoList'
import SearchSummary from './SearchSummary'
import SearchQuery from './SearchQuery'

import styles from '../styles/Search.css'
import card from '../styles/Card.css'

export default class Search extends Component {

  constructor(props) {
    super(props)
    this.timerId = null
  }

  componentDidMount() {
    this.timerId = setInterval(() => {
      this.tick()
    }, 3000)
  }

  componentWillUnmount() {
    this.props.resetTwitterSearch()
    clearInterval(this.timerId)
  }

  search() {
    this.props.createSearch(this.props.query)
  }

  update() {
    if (this.props.active === false) {
      this.props.refreshSearch({
        id: this.props.searchId,
        active: true
      })
      this.tick()
    }
  }

  save() {
    // create a temporary title based on the query
    const values = this.props.query.map((q) => {return q.value})
    const title = values.join(' ')
    this.props.updateSearch({
      id: this.props.searchId,
      title: title,
      saved: true
    })
    this.props.resetTwitterSearch()
  }

  tick() {
    if (this.props.searchId && this.props.active) {
      this.props.getSearch(this.props.searchId)
      this.props.getTweets(this.props.searchId)
      this.props.getHashtags(this.props.searchId)
      this.props.getUsers(this.props.searchId)
      this.props.getUrls(this.props.searchId)
      this.props.getImages(this.props.searchId)
      this.props.getVideos(this.props.searchId)
    }
  }

  render() {
    const spin = this.props.active ? ' fa-spin' : ''
    const style = this.props.tweets.length === 0 ? {display: 'none'} : {}
    const disabled = this.props.query.length === 0

    return (
      <div>
        <div className={styles.SearchBar}>

          <SearchQuery
            updateSearchTerm={this.props.updateSearchTerm}
            addSearchTerm={this.props.addSearchTerm}
            query={this.props.query}
            active={this.props.active} />

          <div className={styles.Controls}>

          <button title="Search" disabled={disabled} onClick={() => {this.search()}}>
            <i className="fa fa-search" aria-hidden="true" />
          </button>

          <button title="Update Search" disabled={disabled} onClick={() => {this.update()}}>
            <i className={'fa fa-refresh' + spin} aria-hidden="true" />
          </button>

          <button title="Save Search" onClick={() => {this.save()}}>
            <i className="fa fa-plus" aria-hidden="true" />
          </button>

          </div>

          <SearchSummary
            id={this.props.searchId}
            maxDate={this.props.maxDate}
            minDate={this.props.minDate}
            count={this.props.count}
            hashtagCount={this.props.hashtags.length}
            active={this.props.active} />

        </div>

        <div className={card.CardHolder} style={style}>

          <div className={card.Card}>
            <TweetList tweets={this.props.tweets} />
            <div className={card.CardTitle}>
              <h2>Tweets</h2>
            </div>
          </div>

          <div className={card.Card}>
            <UserList
              addSearchTerm={this.props.addSearchTerm}
              users={this.props.users}/>
            <div className={card.CardTitle}>
              <h2>Users</h2>
            </div>
          </div>

          <div className={card.Card}>
            <HashtagChart
              addSearchTerm={this.props.addSearchTerm}
              hashtags={this.props.hashtags}/>
            <div className={card.CardTitle}>
              <h2>Hashtags</h2>
            </div>
          </div>

          <div className={card.Card}>
            <UrlList urls={this.props.urls} />
            <div className={card.CardTitle}>
              <h2>URLs</h2>
            </div>
          </div>

          <div className={card.Card}>
            <ImageList images={this.props.images} />
            <div className={card.CardTitle}>
              <h2>Images</h2>
            </div>
          </div>

          <div className={card.Card}>
            <VideoList videos={this.props.videos} />
            <div className={card.CardTitle}>
              <h2>Video</h2>
            </div>
          </div>
        </div>

      </div>
    )
  }
}

Search.propTypes = {
  searchId: PropTypes.string,
  query: PropTypes.array,
  maxDate: PropTypes.string,
  minDate: PropTypes.string,
  count: PropTypes.number,
  tweets: PropTypes.array,
  users: PropTypes.array,
  hashtags: PropTypes.array,
  urls: PropTypes.array,
  images: PropTypes.array,
  videos: PropTypes.array,
  active: PropTypes.bool,
  getSearch: PropTypes.func,
  resetTwitterSearch: PropTypes.func,
  getTweets: PropTypes.func,
  getHashtags: PropTypes.func,
  getUsers: PropTypes.func,
  getUrls: PropTypes.func,
  getImages: PropTypes.func,
  getVideos: PropTypes.func,
  createSearch: PropTypes.func,
  refreshSearch: PropTypes.func,
  updateSearch: PropTypes.func,
  updateSearchTerm: PropTypes.func,
  addSearchTerm: PropTypes.func,
}
