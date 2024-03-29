import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Fab from '@material-ui/core/Fab'

import TweetList from './TweetList'
import UserList from './UserList'
import HashtagChart from './HashtagChart'
import UrlList from './UrlList'
import ImageList from './ImageList'
import VideoList from './VideoList'
import SearchSummary from './SearchSummary'
import SearchQuery from './SearchQuery'
import Intro from '../Intro'

import styles from './Search.css'
import searchTermStyle from './SearchTerm.css'
import card from '../Card.css'
import animations from '../animations.css'

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
    this.props.activateSearch()
    this.props.saveSearch({
      id: this.props.searchId,
      title: title
    })
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
    const spin = this.props.active ? animations.Spin : ''
    const style = this.props.tweets.length === 0 ? {display: 'none'} : {}
    const disabled = this.props.query.length === 0

    let controls = (
      <div className={styles.Controls}>
        <Fab size="medium" title="Search" disabled={disabled}
          tabIndex="0"
          onClick={() => {this.search()}}>
            <ion-icon name="search"></ion-icon>
          </Fab>
        <Fab size="medium" title="Update Search" disabled={disabled}
          tabIndex="0"
          onClick={() => {this.update()}}>
            <span className={`${spin} ${styles.SpinAdj}`}><ion-icon name="sync"></ion-icon></span>
          </Fab>
        <Fab size="medium" title="Save Search" disabled={this.props.active} 
          tabIndex="0"
          onClick={() => {this.save()}}>
            <ion-icon name="filing"></ion-icon>
          </Fab>
      </div>
    )

    if (! this.props.searchId) {
      controls = (
        <div className={styles.Controls}>
          <Fab size="medium" title="Search" disabled={disabled}
            color="primary"
            tabIndex="0"
            onClick={() => {this.search()}}>
              <ion-icon name="search"></ion-icon>
          </Fab>
        </div>
      )
    }

    return (
      <div>
        <Intro>
          Search for 
          a <span className={searchTermStyle.Keyword}>keyword</span> <span className={searchTermStyle.Hashtag}>hashtag</span> <span className={searchTermStyle.User}>user</span> or <span className={searchTermStyle.Phrase}>phrase</span> to explore the most recent 1000 tweets containing that term. You can refine and re-run your search until you have the best terms for your collection, then save your search.
        </Intro>

        <div className={styles.SearchBar}>

          <SearchQuery
            updateSearchTerm={this.props.updateSearchTerm}
            addSearchTerm={this.props.addSearchTerm}
            focusSearchTerm={this.props.focusSearchTerm}
            query={this.props.query}
            active={this.props.active}
            createSearch={this.props.createSearch} />

          {controls}

          <SearchSummary
            id={this.props.searchId}
            maxDate={this.props.maxDate}
            minDate={this.props.minDate}
            tweetCount={this.props.tweetCount}
            hashtagCount={this.props.hashtags.length}
            active={this.props.active} />

        </div>

        <div className={card.CardHolder} style={style}>

          <Card raised className={card.Card} >
            <CardContent className={`${card.Scroll} ${card.NoPadding}`}>
              <TweetList tweets={this.props.tweets} />
            </CardContent>

            <CardActions className={card.CardActions}>
              <h2 className={card.PlaceHeader}>Tweets</h2>
            </CardActions>
          </Card>

          <Card raised className={card.Card} >
            <CardContent className={`${card.Scroll} ${card.NoPadding}`}>
              <UserList
                addSearchTerm={this.props.addSearchTerm}
                users={this.props.users}/>
            </CardContent>

            <CardActions className={card.CardActions}>
              <h2 className={card.PlaceHeader}>Users</h2>
            </CardActions>
          </Card>

          <Card raised className={card.Card} >
            <CardContent className={`${card.Scroll} ${card.NoPadding}`}>
              <HashtagChart
                addSearchTerm={this.props.addSearchTerm}
                hashtags={this.props.hashtags}
                query={this.props.query} />
            </CardContent>

            <CardActions className={card.CardActions}>
              <h2 className={card.PlaceHeader}>Hashtags</h2>
            </CardActions>
          </Card>

          <Card raised className={card.Card} >
            <CardContent className={`${card.Scroll} ${card.NoPadding}`}>
              <UrlList urls={this.props.urls} />
            </CardContent>

            <CardActions className={card.CardActions}>
              <h2 className={card.PlaceHeader}>URLs</h2>
            </CardActions>
          </Card>

          <Card raised className={card.Card} >
            <CardContent className={`${card.Scroll} ${card.NoPadding}`}>
              <ImageList images={this.props.images} />
            </CardContent>

            <CardActions className={card.CardActions}>
              <h2 className={card.PlaceHeader}>Images</h2>
            </CardActions>
          </Card>

          <Card raised className={card.Card} >
            <CardContent className={`${card.Scroll} ${card.NoPadding}`}>
              <VideoList videos={this.props.videos} />
            </CardContent>

            <CardActions className={card.CardActions}>
              <h2 className={card.PlaceHeader}>Video</h2>
            </CardActions>
          </Card>
        </div>

      </div>
    )
  }
}

Search.propTypes = {
  searchId: PropTypes.number,
  query: PropTypes.array,
  queries: PropTypes.array,
  maxDate: PropTypes.string,
  minDate: PropTypes.string,
  tweetCount: PropTypes.number,
  tweets: PropTypes.array,
  users: PropTypes.array,
  hashtags: PropTypes.array,
  urls: PropTypes.array,
  images: PropTypes.array,
  videos: PropTypes.array,
  active: PropTypes.bool,
  searches: PropTypes.array,

  getSearch: PropTypes.func,
  resetTwitterSearch: PropTypes.func,
  getTweets: PropTypes.func,
  getHashtags: PropTypes.func,
  getUsers: PropTypes.func,
  getUrls: PropTypes.func,
  getImages: PropTypes.func,
  getVideos: PropTypes.func,
  createSearch: PropTypes.func,
  activateSearch: PropTypes.func,
  refreshSearch: PropTypes.func,
  updateSearch: PropTypes.func,
  updateSearchTerm: PropTypes.func,
  addSearchTerm: PropTypes.func,
  focusSearchTerm: PropTypes.func,
  saveSearch: PropTypes.func,
}
