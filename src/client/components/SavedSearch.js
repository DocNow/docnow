import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cardStyle from '../styles/Card.css'
import webpageStyle from '../styles/Webpage.css'
import Webpage from './Webpage'
import TweetsModal from './TweetsModal'

export default class SavedSearch extends Component {

  constructor(props) {
    super(props)
    this.timerId = null
    this.modalOpen = true
  }

  componentWillMount() {
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

  tick() {
    this.props.getWebpages(this.props.searchId)
    this.props.getQueueStats(this.props.searchId)
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
            searchId={this.props.searchId}
            getTweetsForUrl={this.props.getTweetsForUrl} />
          ))}
        </div>

      </div>
    )
  }
}

SavedSearch.propTypes = {
  searchId: PropTypes.string,
  webpages: PropTypes.array,
  getWebpages: PropTypes.func,
  resetWebpages: PropTypes.func,
  getQueueStats: PropTypes.func,
  getTweetsForUrl: PropTypes.func,
  resetTweets: PropTypes.func,
  total: PropTypes.number,
  remaining: PropTypes.number,
  tweets: PropTypes.array
}
