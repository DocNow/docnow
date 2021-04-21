import React, { Component } from 'react'
import PropTypes from 'prop-types'
import UsersBody from './UsersBody'
import SearchInfo from './SearchInfo'
import BackButton from './BackButton'

export default class Users extends Component {

  constructor(props) {
    super(props)
    this.timerId = null
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

  render() {
    return (
      <div>

        <SearchInfo
          title={this.props.search.title}
          description={this.props.search.description}
          search={this.props.search}
          updateSearch={this.props.updateSearch} />

        <BackButton 
          searchId={this.props.searchId}
          navigateTo={this.props.navigateTo}/>

        <UsersBody
          searchId={this.props.searchId}
          getTweetsForUser={this.props.getTweetsForUser}
          resetTweets={this.props.resetTweets}
          tweets={this.props.tweets}
          userCount={this.props.search.userCount}
          users={this.props.search.users}
          getUsers={this.props.getUsers}
        />

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
