import React, { Component } from 'react'
import PropTypes from 'prop-types'
import User from './User'
import TweetsModal from './TweetsModal'

import cardStyle from '../Card.css'

export default class Users extends Component {

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
          {this.props.search.users.map((i) => {
            return (
              <User
                key={i.id}
                name={i.name}
                screenName={i.screenName}
                avatarUrl={i.avatarUrl}
                url={i.url}
                created={i.created}
                desc={i.description}
                count={i.tweetsInSearch}
                friends={i.friendsCount}
                followers={i.followersCount}
                searchId={this.props.searchId}
                getTweetsForUser={this.props.getTweetsForUser} />
            )
          })}
        </div>

      </div>
    )
  }
}

Users.propTypes = {
  searchId: PropTypes.string,
  search: PropTypes.object,
  getTweetsForUser: PropTypes.func,
  resetTweets: PropTypes.func,
  tweets: PropTypes.array,
}
