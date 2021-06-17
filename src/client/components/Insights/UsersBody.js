import React, { Component } from 'react'
import PropTypes from 'prop-types'
import User from './User'
import TweetsModal from './TweetsModal'

import cardStyle from '../Card.css'
import animations from '../animations.css'
import exploreStyles from '../Explore/Explore.css'

export default class UsersBody extends Component {

  constructor(props) {
    super(props)
    this.modalOpen = true
    this.users = this.props.users
    this.offset = 0
    this.loading = false

    this.handleScroll = () => {
      requestAnimationFrame(() => this.update())
    }
  }

  closeModal() {
    this.props.resetTweets()
  }

  componentDidUpdate() {
    if (this.users && this.props.users.length > 0) {
      if (this.users[this.users.length - 1].id !== this.props.users[this.props.users.length - 1].id) {
        this.users = this.users.concat(this.props.users)
        this.loading = true
        window.addEventListener('scroll', this.handleScroll)
      }
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll)
  }
 
  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  update() {
    const distanceToBottom =
      document.documentElement.offsetHeight -
      (window.scrollY + window.innerHeight)
    if (distanceToBottom < 150) {
      window.removeEventListener(`scroll`, this.handleScroll)
      this.offset = this.offset + 100
      if (this.offset <= this.props.userCount) {        
        this.loading = true
        this.props.getUsers(this.props.searchId, this.offset)
      }
    }
  }

  render() {
    const modalOpen = this.props.tweets.length > 0
    const loader = !this.loading ? '' : (<span className={`${animations.Spin} ${exploreStyles.Loader}`}>
      <ion-icon name="logo-ionic"></ion-icon>
    </span>)

    return (
      <div>

        <TweetsModal
          isOpen={modalOpen}
          close={() => {this.closeModal()}}
          tweets={this.props.tweets} />

        <div className={cardStyle.CardHolder}>
          {this.users.map(t => {
            return (
              <User
                key={t.id}
                name={t.name}
                screenName={t.screenName}
                avatarUrl={t.avatarUrl}
                url={t.url}
                created={t.created}
                desc={t.description}
                count={t.tweetsInSearch}
                friends={t.friendsCount}
                followers={t.followersCount}
                searchId={this.props.searchId}
                getTweetsForUser={this.props.getTweetsForUser} />
            )
          })}
          {loader}
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
