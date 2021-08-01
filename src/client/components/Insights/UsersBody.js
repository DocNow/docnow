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

    this.state = {
      users: this.props.users || [],
      offset: 0,
    }

    this.handleScroll = () => {
      requestAnimationFrame(() => this.update())
    }
  }

  closeModal() {
    this.props.resetTweets()
  }

  componentDidUpdate() {
    let haveNewData = false

    if (this.state.users.length > 0 && 
      this.props.users.length > 0 && 
      this.state.users[this.state.users.length - 1].id !== this.props.users[this.props.users.length - 1].id) {
      haveNewData = true
    } else if (this.state.users.length == 0 && this.props.users.length > 0) {
      haveNewData = true
    }

    if (haveNewData) {
      this.setState({
        users: this.state.users.concat(this.props.users),
      })
      window.addEventListener('scroll', this.handleScroll)
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
      const newOffset = this.state.offset + 100
      if (newOffset <= this.props.userCount) {        
        this.setState({offset: newOffset})
        this.props.getUsers(this.props.searchId, newOffset)
      }
    }
  }

  render() {
    const modalOpen = this.props.tweets.length > 0

    const loader = this.state.users.length == this.props.userCount ? '' : (
      <span className={`${animations.Spin} ${exploreStyles.Loader}`}>
        <ion-icon name="logo-ionic"></ion-icon>
      </span>
    )

    return (
      <div>

        <TweetsModal
          isOpen={modalOpen}
          close={() => {this.closeModal()}}
          tweets={this.props.tweets} />

        <div className={cardStyle.CardHolder}>
          {this.state.users.map(t => {
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
  searchId: PropTypes.number,
  users: PropTypes.array,
  userCount: PropTypes.number,
  getTweetsForUser: PropTypes.func,
  getUsers: PropTypes.func,
  resetTweets: PropTypes.func,
  tweets: PropTypes.array,
}
