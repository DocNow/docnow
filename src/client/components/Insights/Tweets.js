import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SearchInfo from './SearchInfo'
import BackButton from './BackButton'
import TweetsBody from './TweetsBody'

class Tweets extends Component {
  componentDidMount() {
    this.tick()
    this.timerId = setInterval(() => {
      this.tick()
    }, 3000)
  }

  componentWillUnmount() {
    clearInterval(this.timerId)
  }

  tick() {
    this.props.getSearch(this.props.searchId)
    if (this.props.search.tweets.length === 0) {
      this.props.getTweets(this.props.searchId)
    }
  }

  render() {
    return (
      <div>
        <SearchInfo
          title={this.props.search.title}
          description={this.props.search.description}
          search={this.props.search}
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
  searchId: PropTypes.string,
  search: PropTypes.object,
  getTweets: PropTypes.func,
  getSearch: PropTypes.func,
  updateSearch: PropTypes.func,
  navigateTo: PropTypes.func
}

export default Tweets
