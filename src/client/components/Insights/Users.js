import React, { Component } from 'react'
import PropTypes from 'prop-types'
import User from './User'
import TweetsModal from './TweetsModal'
import SearchInfo from './SearchInfo'
import BackButton from './BackButton'

import cardStyle from '../Card.css'

export default class Users extends Component {

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
    if (this.props.search.users.length === 0 || this.scrolledUp()) {
      this.props.getUsers(this.props.searchId)
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
  getUsers: PropTypes.func,
  getSearch: PropTypes.func,
  getTweetsForUser: PropTypes.func,
  resetTweets: PropTypes.func,
  updateSearch: PropTypes.func,
  tweets: PropTypes.array,
  navigateTo: PropTypes.func
}
