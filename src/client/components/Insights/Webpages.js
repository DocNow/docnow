import React, { Component } from 'react'
import PropTypes from 'prop-types'
import WebpagesBody from './WebpagesBody'
import SearchInfo from './SearchInfo'
import BackButton from './BackButton'

import style from './Webpages.css'

export default class Webpages extends Component {

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
    if (this.props.webpages.length === 0 || this.scrolledUp()) {
      this.props.getQueueStats(this.props.searchId)
      this.props.getWebpages(this.props.searchId)
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

        <div className={style.Queue}>
          URLs Checked: {this.props.total - this.props.remaining}/{this.props.total}
        </div>

        <WebpagesBody 
          searchId={this.props.searchId}
          search={this.props.search}
          webpages={this.props.webpages}
          getTweetsForUrl={this.props.getTweetsForUrl}
          resetTweets={this.props.resetTweets}
          tweets={this.props.tweets}
          selectWebpage={this.props.selectWebpage}
          deselectWebpage={this.props.deselectWebpage}
          checkArchive={this.props.checkArchive}
          saveArchive={this.props.saveArchive} />

      </div>
    )
  }
}

Webpages.propTypes = {
  searchId: PropTypes.string,
  search: PropTypes.object,
  user: PropTypes.object,
  instanceTweetText: PropTypes.string,
  academic: PropTypes.boolean,
  webpages: PropTypes.array,
  getWebpages: PropTypes.func,
  resetWebpages: PropTypes.func,
  getQueueStats: PropTypes.func,
  getTweetsForUrl: PropTypes.func,
  resetTweets: PropTypes.func,
  total: PropTypes.number,
  remaining: PropTypes.number,
  tweets: PropTypes.array,
  selectWebpage: PropTypes.func,
  deselectWebpage: PropTypes.func,
  checkArchive: PropTypes.func,
  saveArchive: PropTypes.func,
  getSearch: PropTypes.func,
  updateSearch: PropTypes.func,
  navigateTo: PropTypes.func
}
