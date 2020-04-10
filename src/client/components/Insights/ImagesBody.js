import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Img from './Image'
import TweetsModal from './TweetsModal'

import cardStyle from '../Card.css'

export default class ImagesBody extends Component {

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
          {this.props.search.images.map((i) => {
            return (             
              <Img
                key={i.url}
                url={i.url}
                count={i.count}
                searchId={this.props.searchId}
                getTweetsForImage={this.props.getTweetsForImage} />
            )
          })}
        </div>

      </div>
    )
  }
}

ImagesBody.propTypes = {
  searchId: PropTypes.string,
  search: PropTypes.object,
  getTweetsForImage: PropTypes.func,
  resetTweets: PropTypes.func,
  tweets: PropTypes.array
}
