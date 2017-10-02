import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TweetList from './TweetList'
import UserList from './UserList'
import Hashtags from './Hashtags'
import Media from './Media'
import SearchSummary from './SearchSummary'

import styles from '../styles/Search.css'
import button from '../styles/Button.css'
import card from '../styles/Card.css'

export default class Search extends Component {

  constructor(props) {
    super(props)
    this.state = {searchTerm: ''}
    this.timerId = null
    this.setSearchTerm = this.setSearchTerm.bind(this)
    this.searchNewTerm = this.searchNewTerm.bind(this)
  }

  componentDidMount() {
    this.props.searchTwitter(this.props.q)
    this.setState({
      searchTerm: this.props.q
    })
    this.timerId = setInterval(() => {
      this.tick()
    }, 3000)
  }

  componentWillUnmount() {
    clearInterval(this.timerId)
  }

  tick() {
    if (this.props.id) {
      this.props.getSearch(this.props.id)
      this.props.getTweets(this.props.id)
      this.props.getHashtags(this.props.id)
      this.props.getUsers(this.props.id)
    }
  }

  setSearchTerm(e) {
    this.setState({
      searchTerm: encodeURIComponent(e.target.value)
    })
  }

  searchNewTerm() {
    window.location = `/search/${this.state.searchTerm}`
  }

  render() {
    return (
      <div>
        <div className={styles.SearchBar}>
          <div className={styles.Form}>
            <input
              required
              type="text"
              value={decodeURIComponent(this.state.searchTerm)}
              placeholder="#hashtag"
              onChange={this.setSearchTerm} />
            <button
              className={button.Button}
              onClick={this.searchNewTerm}>
              <i className="fa fa-search" aria-hidden="true"/>
            </button>
            <a href="#">Search tips</a>
          </div>
        </div>

        <SearchSummary
          maxDate={this.props.maxDate}
          minDate={this.props.minDate}
          count={this.props.count} />

        <div className={card.CardHolder}>

          <div className={card.Card}>
            <TweetList tweets={this.props.tweets} />
            <div className={card.CardTitle}>
              <h2>Tweets</h2>
            </div>
          </div>

          <div className={card.Card}>
            <UserList users={this.props.users}/>
            <div className={card.CardTitle}>
              <h2>Users</h2>
            </div>
          </div>

          <div className={card.Card}>
            <Hashtags hashtags={this.props.hashtags}/>
            <div className={card.CardTitle}>
              <h2>Hashtags</h2>
            </div>
          </div>

          <div className={card.Card}>
            <div className={card.Data}>
              <Media tweets={this.props.tweets}/>
            </div>
            <div className={card.CardTitle}>
              <h2>URLs</h2>
            </div>
          </div>

          <div className={card.Card}>
            <div className={card.Data}>
              <Media tweets={this.props.tweets}/>
            </div>
            <div className={card.CardTitle}>
              <h2>Images</h2>
            </div>
          </div>

          <div className={card.Card}>
            <div className={card.Data}>
              <Media tweets={this.props.tweets}/>
            </div>
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
  id: PropTypes.string,
  q: PropTypes.string,
  maxDate: PropTypes.string,
  minDate: PropTypes.string,
  count: PropTypes.number,
  tweets: PropTypes.array,
  users: PropTypes.array,
  hashtags: PropTypes.array,
  searchTwitter: PropTypes.func,
  getSearch: PropTypes.func,
  getTweets: PropTypes.func,
  getHashtags: PropTypes.func,
  getUsers: PropTypes.func
}
