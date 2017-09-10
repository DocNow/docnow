import React, { Component } from 'react'
import PropTypes from 'prop-types'
import introStyles from '../styles/Intro.css'
import styles from '../styles/Search.css'
import button from '../styles/Button.css'
import cards from '../styles/Card.css'
import TweetListBox from '../containers/TweetListBox'
import UserListBox from '../containers/UserListBox'
import HashtagsBox from '../containers/HashtagsBox'
import MediaBox from '../containers/MediaBox'

export default class Search extends Component {
  constructor(props) {
    super(props)
    this.state = { searchTerm: '' }
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
      <div className={styles.SearchBar}>
        <div className={styles.Form}>
          <input type="text" value={decodeURIComponent(this.state.searchTerm)} placeholder="#hashtag" required
            onChange={this.setSearchTerm} />
          <button className={button.Button} onClick={this.searchNewTerm}> <i className="fa fa-search" aria-hidden="true"/></button> <a href="#">Search tips</a>
        </div>
        <div className={introStyles.IntroP}><center>Retrieved XX,XXX tweets so far using Twitter Search API for last 24 hours and Twitter Stream API</center></div>
        <div className={cards.Cardholder}>
          <div className={cards.Card}>
            <div className={cards.Cardtitle}>
              <h2>Sample Tweets</h2>
            </div>
            <div className={cards.Data}>
              <TweetListBox endpoint={this.props.searchInfo.tweets}/>
            </div>
          </div>
          <div className={cards.Card}>
            <div className={cards.Cardtitle}>
              <h2>Top Users</h2>
            </div>
            <div className={cards.Data}>
              <UserListBox endpoint={this.props.searchInfo.users}/>
            </div>
          </div>
          <div className={cards.Card}>
            <div className={cards.Cardtitle}>
              <h2>Top Hashtags</h2>
            </div>
            <div className={cards.Data}>
              <HashtagsBox endpoint={this.props.searchInfo.hashtags}/>
            </div>
          </div>
          <div className={cards.Card}>
            <div className={cards.Data}>
              <MediaBox endpoint={this.props.searchInfo.tweets}/>
            </div>
            <div className={cards.Cardtitle}>
              <h2>Media</h2>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

// <div className={ style.Column }>
// <div className={ style.Row }>
//   <div>
//     <h4>Sample Tweets</h4>
//     <TweetListBox endpoint={this.props.searchInfo.tweets}/>
//   </div>
//   <div>
//     <h4>Top Users</h4>
//     <UserListBox endpoint={this.props.searchInfo.users}/>
//   </div>
//   <div>
//     <h4>Top Hashtags</h4>
//     <HashtagsBox endpoint={this.props.searchInfo.hashtags}/>
//   </div>
// </div>
// <div className={ style.Row }>
// <div>
//   <h4>Media</h4>
//   <MediaBox endpoint={this.props.searchInfo.tweets}/>
// </div>
// </div>
// </div>

Search.propTypes = {
  searchInfo: PropTypes.object,
  q: PropTypes.string,
  searchTwitter: PropTypes.func
}
