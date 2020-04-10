import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Webpage from './Webpage'
import TweetsModal from './TweetsModal'

import cardStyle from '../Card.css'

export default class WebpagesBody extends Component {

  constructor(props) {
    super(props)
    this.modalOpen = true
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

WebpagesBody.propTypes = {
  searchId: PropTypes.string,
  search: PropTypes.object,
  webpages: PropTypes.array,
  getTweetsForUrl: PropTypes.func,
  resetTweets: PropTypes.func,
  tweets: PropTypes.array,
  selectWebpage: PropTypes.func,
  deselectWebpage: PropTypes.func,
  checkArchive: PropTypes.func,
  saveArchive: PropTypes.func,
}
