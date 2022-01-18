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
          academic={this.props.academic}
          updateSearch={this.props.updateSearch}
          deleteSearch={this.props.deleteSearch}
          createArchive={this.props.createArchive} />

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
  academic: PropTypes.boolean,
  getSearch: PropTypes.func,
  getActions: PropTypes.func,
  updateSearch: PropTypes.func,
  deleteSearch: PropTypes.func,
  createArchive: PropTypes.func,
  navigateTo: PropTypes.func
}
