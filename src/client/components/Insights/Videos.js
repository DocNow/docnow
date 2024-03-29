import React, { Component } from 'react'
import PropTypes from 'prop-types'
import VideosBody from './VideosBody'
import SearchInfo from './SearchInfo'
import BackButton from './BackButton'

export default class Videos extends Component {

  constructor(props) {
    super(props)
    this.timerId = null
  }

  componentDidMount() {
    this.tick()
    this.timerId = setInterval(() => {
      this.tick()
    }, 3000)
  }

  componentWillUnmount() {
    clearInterval(this.timerId)
  }

  scrolledUp() {
    return document.documentElement.scrollTop === 0
  }

  tick() {
    this.props.getSearch(this.props.searchId)
    if (this.props.search.videos.length === 0 || this.scrolledUp()) {
      this.props.getVideos(this.props.searchId)
    }
  }

  closeModal() {
    this.props.resetTweets()
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

        <VideosBody
          searchId={this.props.searchId}
          search={this.props.search}
          getTweetsForVideo={this.props.getTweetsForVideo}
          resetTweets={this.props.resetTweets}
          tweets={this.props.tweets} />

      </div>
    )
  }
}

Videos.propTypes = {
  searchId: PropTypes.number,
  search: PropTypes.object,
  user: PropTypes.object,
  instanceTweetText: PropTypes.string,
  academic: PropTypes.bool,
  getVideos: PropTypes.func,
  getSearch: PropTypes.func,
  getTweetsForVideo: PropTypes.func,
  resetTweets: PropTypes.func,
  updateSearch: PropTypes.func,
  tweets: PropTypes.array,
  navigateTo: PropTypes.func
}
