import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TweetListBox from '../containers/TweetListBox'
import UserListBox from '../containers/UserListBox'
import HashtagsBox from '../containers/HashtagsBox'
import MediaBox from '../containers/MediaBox'
import SearchSummaryBox from '../containers/SearchSummaryBox'

import styles from '../styles/Search.css'
import button from '../styles/Button.css'
import card from '../styles/Card.css'

export default class Search extends Component {

  constructor(props) {
    super(props)
    this.state = {searchTerm: ''}
    this.setSearchTerm = this.setSearchTerm.bind(this)
    this.searchNewTerm = this.searchNewTerm.bind(this)
  }

  componentDidMount() {
    this.props.searchTwitter(this.props.q)
    this.setState({
      searchTerm: this.props.q
    })
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

        <SearchSummaryBox />

        <div className={card.CardHolder}>

          <div className={card.Card}>
            <TweetListBox />
            <div className={card.CardTitle}>
              <h2>Tweets</h2>
            </div>
          </div>

          <div className={card.Card}>
            <UserListBox />
            <div className={card.CardTitle}>
              <h2>Users</h2>
            </div>
          </div>

          <div className={card.Card}>
            <HashtagsBox />
            <div className={card.CardTitle}>
              <h2>Hashtags</h2>
            </div>
          </div>

          <div className={card.Card}>
            <div className={card.Data}>
              <MediaBox />
            </div>
            <div className={card.CardTitle}>
              <h2>URLs</h2>
            </div>
          </div>

          <div className={card.Card}>
            <div className={card.Data}>
              <MediaBox />
            </div>
            <div className={card.CardTitle}>
              <h2>Images</h2>
            </div>
          </div>

          <div className={card.Card}>
            <div className={card.Data}>
              <MediaBox />
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
  searchTwitter: PropTypes.func,
}
