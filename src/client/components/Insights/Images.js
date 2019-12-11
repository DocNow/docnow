import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Img from './Image'
import TweetsModal from './TweetsModal'
import SearchInfo from './SearchInfo'
import BackButton from './BackButton'

import cardStyle from '../Card.css'

export default class Images extends Component {

  constructor(props) {
    super(props)
    this.timerId = null
    this.modalOpen = true
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
    const modalOpen = this.props.tweets.length > 0

    return (
      <div>

        <TweetsModal
          isOpen={modalOpen}
          close={() => {this.closeModal()}}
          tweets={this.props.tweets} />

        <SearchInfo
          title={this.props.search.title}
          description={this.props.search.description}
          search={this.props.search}
          updateSearch={this.props.updateSearch} />

        <BackButton 
          searchId={this.props.searchId}
          navigateTo={this.props.navigateTo}/>

        <div className={cardStyle.CardHolder}>
          {this.props.search.images.map((i) => {
            return (             
              <Img
                key={i.url}
                url={i.url}
                count={i.count}
                tweets={i.ids}
                searchId={this.props.searchId}
                getTweetsByIds={this.props.getTweetsByIds} />
            )
          })}
        </div>

      </div>
    )
  }
}

Images.propTypes = {
  searchId: PropTypes.string,
  search: PropTypes.object,
  getImages: PropTypes.func,
  getSearch: PropTypes.func,
  getTweetsByIds: PropTypes.func,
  resetTweets: PropTypes.func,
  updateSearch: PropTypes.func,
  tweets: PropTypes.array,
  navigateTo: PropTypes.func
}
