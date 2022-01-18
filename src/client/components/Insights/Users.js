import React, { Component } from 'react'
import PropTypes from 'prop-types'
import UsersBody from './UsersBody'
import SearchInfo from './SearchInfo'
import BackButton from './BackButton'

export default class Users extends Component {

  componentDidMount() {
    this.props.getSearch(this.props.searchId)
    this.props.getUsers(this.props.searchId)
  }

  render() {
    return (
      <div>

        <SearchInfo
          search={this.props.search}
          user={this.props.user}
          instanceTweetText={this.props.instanceTweetText}
          academic={this.props.academic}
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
  searchId: PropTypes.number,
  search: PropTypes.object,
  user: PropTypes.object,
  instanceTweetText: PropTypes.string,
  academic: PropTypes.boolean,
  getUsers: PropTypes.func,
  getSearch: PropTypes.func,
  getTweetsForUser: PropTypes.func,
  resetTweets: PropTypes.func,
  updateSearch: PropTypes.func,
  tweets: PropTypes.array,
  navigateTo: PropTypes.func
}
