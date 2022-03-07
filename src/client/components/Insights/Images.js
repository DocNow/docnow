import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SearchInfo from './SearchInfo'
import BackButton from './BackButton'
import ImagesBody from './ImagesBody'


export default class Images extends Component {

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
    if (this.props.search.images.length === 0 || this.scrolledUp()) {
      this.props.getImages(this.props.searchId)
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
          navigateTo={this.props.navigateTo} />

        <ImagesBody
          searchId={this.props.searchId}
          search={this.props.search}
          getTweetsForImage={this.props.getTweetsForImage}
          resetTweets={this.props.resetTweets}
          tweets={this.props.tweets} />

      </div>
    )
  }
}

Images.propTypes = {
  searchId: PropTypes.string,
  search: PropTypes.object,
  user: PropTypes.user,
  instanceTweetText: PropTypes.string,
  academic: PropTypes.bool,
  getImages: PropTypes.func,
  getSearch: PropTypes.func,
  getTweetsForImage: PropTypes.func,
  resetTweets: PropTypes.func,
  updateSearch: PropTypes.func,
  tweets: PropTypes.array,
  navigateTo: PropTypes.func
}
