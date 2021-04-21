import React, { Component } from 'react'
import PropTypes from 'prop-types'
import User from './User'
import TweetsModal from './TweetsModal'

import cardStyle from '../Card.css'

export default class UsersBody extends Component {

  constructor(props) {
    super(props)
    this.modalOpen = true
    this.users = this.props.users
    this.offset = 0
  }

  closeModal() {
    this.props.resetTweets()
  }

  componentDidMount() {
    window.addEventListener(`scroll`, () => this.handleScroll())
  }

  componentDidUpdate() {
    if (this.users && this.props.users.length > 0) {
      if (this.users[this.users.length - 1].id !== this.props.users[this.props.users.length - 1].id) {
        this.users = this.users.concat(this.props.users)
      }
    }
  }

  update() {
    const distanceToBottom =
      document.documentElement.offsetHeight -
      (window.scrollY + window.innerHeight)
    if (distanceToBottom < 150) {
      this.offset = this.offset + 100
      if (this.offset <= this.props.userCount) {
        this.props.getUsers(this.props.searchId, this.offset)
      }
    }
    this.ticking = false
  }

  handleScroll() {
    if (!this.ticking) {
      this.ticking = true
      requestAnimationFrame(() => this.update())
    }
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
          {this.users.map((i) => {
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

UsersBody.propTypes = {
  searchId: PropTypes.string,
  users: PropTypes.array,
  userCount: PropTypes.int,
  getTweetsForUser: PropTypes.func,
  getUsers: PropTypes.func,
  resetTweets: PropTypes.func,
  tweets: PropTypes.array,
}
