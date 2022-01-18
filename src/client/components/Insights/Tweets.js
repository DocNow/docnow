import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SearchInfo from './SearchInfo'
import BackButton from './BackButton'
import TweetsBody from './TweetsBody'

class Tweets extends Component {

  componentDidMount() {
    this.props.getSearch(this.props.searchId)
    this.props.getTweets(this.props.searchId)
  }

  render() {
    return (
      <div>
        <SearchInfo
          search={this.props.search}
          user={this.props.user}
          instanceTweetText={this.props.instanceTweetText}
          academic={this.props.academic}
          updateSearch={this.props.updateSearch} />

        <BackButton 
          searchId={this.props.searchId}
          navigateTo={this.props.navigateTo}/>

        <TweetsBody
          displayRetweets={this.props.displayRetweets}
          chunkSize={this.props.chunkSize}
          tweets={this.props.search.tweets}
          tweetCount={this.props.search.tweetCount}
          searchId={this.props.searchId}
          getTweets={this.props.getTweets} />

      </div>
    )
  }
}

Tweets.propTypes = {
  displayRetweets: PropTypes.bool,
  chunkSize: PropTypes.number,
  searchId: PropTypes.number,
  search: PropTypes.object,
  user: PropTypes.object,
  instanceTweetText: PropTypes.string,
  academic: PropTypes.boolean,
  getTweets: PropTypes.func,
  getSearch: PropTypes.func,
  updateSearch: PropTypes.func,
  navigateTo: PropTypes.func
}

export default Tweets
