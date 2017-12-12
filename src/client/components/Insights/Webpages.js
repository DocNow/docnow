import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Webpage from './Webpage'
import TweetsModal from './TweetsModal'
import SearchInfo from './SearchInfo'
import cardStyle from '../../styles/Card.css'
import webpageStyle from '../../styles/Webpage.css'

export default class Webpages extends Component {

  constructor(props) {
    super(props)
    this.timerId = null
    this.modalOpen = true
  }

  componentWillMount() {
    this.tick()
    this.props.resetWebpages()
    this.props.resetTweets()
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
    const modalOpen = this.props.tweets.length > 0

    return (
      <div>

        <TweetsModal
          isOpen={modalOpen}
          close={() => {this.closeModal()}}
          tweets={this.props.tweets} />

        <div className={webpageStyle.Queue}>
          URLs Checked: {this.props.total - this.props.remaining}/{this.props.total}
        </div>

        <SearchInfo
          title={this.props.search.title}
          description={this.props.search.description}
          search={this.props.search}
          updateSearch={this.props.updateSearch} />

        <div className={cardStyle.CardHolder}>
          {this.props.webpages.map((w) => (
          <Webpage
            key={w.url}
            url={w.url}
            title={w.title}
            image={w.image}
            count={w.count}
            description={w.description}
            keywords={w.keywords}
            selected={w.selected}
            deselected={w.deselected}
            archive={w.archive}
            checkArchive={this.props.checkArchive}
            saveArchive={this.props.saveArchive}
            searchId={this.props.searchId}
            getTweetsForUrl={this.props.getTweetsForUrl}
            selectWebpage={this.props.selectWebpage}
            deselectWebpage={this.props.deselectWebpage} />
          ))}
        </div>

      </div>
    )
  }
}

Webpages.propTypes = {
  searchId: PropTypes.string,
  search: PropTypes.object,
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
}
