import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Video from './Video'
import TweetsModal from './TweetsModal'

import cardStyle from '../Card.css'

export default class VideosBody extends Component {

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
          {this.props.search.videos.map((i) => {
            return (
              <Video
                key={i.url}
                url={i.url}
                thumbnailUrl={i.thumbnailUrl}
                count={i.count}
                searchId={this.props.searchId}
                getTweetsForVideo={this.props.getTweetsForVideo} />
            )
          })}
        </div>

      </div>
    )
  }
}

VideosBody.propTypes = {
  searchId: PropTypes.number,
  search: PropTypes.object,
  getTweetsForVideo: PropTypes.func,
  resetTweets: PropTypes.func,
  tweets: PropTypes.array
}
