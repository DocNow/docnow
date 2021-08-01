import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ActionsBody from './ActionsBody'
import SearchInfo from './SearchInfo'
import BackButton from './BackButton'

export default class Actions extends Component {

  componentDidMount() {
    this.props.getSearch(this.props.searchId)
    this.props.getActions(this.props.searchId, true)
  }

  render() {

    return (
      <div>

        <SearchInfo
          search={this.props.search}
          user={this.props.user}
          instanceTweetText={this.props.instanceTweetText}
          updateSearch={this.props.updateSearch} />

          <BackButton 
            searchId={this.props.searchId}
            navigateTo={this.props.navigateTo}/>

        <ActionsBody 
          searchId={this.props.searchId}
          search={this.props.search} />

      </div>
    )
  }
}

Actions.propTypes = {
  searchId: PropTypes.number,
  search: PropTypes.object,
  user: PropTypes.object,
  instanceTweetText: PropTypes.string,
  getSearch: PropTypes.func,
  getActions: PropTypes.func,
  updateSearch: PropTypes.func,
  navigateTo: PropTypes.func
}