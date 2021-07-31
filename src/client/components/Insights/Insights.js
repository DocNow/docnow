import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SearchInfo from './SearchInfo'
import InsightsBody from './InsightsBody'

import style from './Insights.css'

export default class Insights extends Component {
  componentDidMount() {
    this.props.resetTwitterSearch()
    this.tick()
    this.props.getUsers(this.props.searchId)
    this.props.getTweets(this.props.searchId)
    this.props.getImages(this.props.searchId)
    this.props.getVideos(this.props.searchId)
    this.props.getWebpages(this.props.searchId)
    this.props.getHashtags(this.props.searchId)
    this.props.getActions(this.props.searchId, true)

    this.timerId = setInterval(() => {
      this.tick()
    }, 3000)
  }

  componentWillUnmount() {
    clearInterval(this.timerId)
    this.props.resetTwitterSearch()
  }

  tick() {
    this.props.getSearch(this.props.searchId)
  }

  render() {

    // don't render until we at least know the title of the search
    if (! this.props.search.title) {
      return <div />
    }

    return (
      <div className={style.Insights}>

        <SearchInfo
          title={this.props.search.title}
          search={this.props.search}
          searches={this.props.searches}
          user={this.props.user}
          instanceTweetText={this.props.instanceTweetText}
          updateSearch={this.props.updateSearch}
          deleteSearch={this.props.deleteSearch}
          createArchive={this.props.createArchive} />

        <InsightsBody
          searchId={this.props.searchId}
          search={this.props.search}
          webpages={this.props.webpages} />

    </div>
    )
  }
}

Insights.propTypes = {
  searchId: PropTypes.string,
  search: PropTypes.object,
  searches: PropTypes.array,
  actions: PropTypes.array,
  user: PropTypes.object,
  instanceTweetText: PropTypes.string,
  webpages: PropTypes.array,
  getSearch: PropTypes.func,
  getTweets: PropTypes.func,
  getUsers: PropTypes.func,
  getVideos: PropTypes.func,
  getImages: PropTypes.func,
  getWebpages: PropTypes.func,
  resetTwitterSearch: PropTypes.func,
  updateSearch: PropTypes.func,
  deleteSearch: PropTypes.func,
  createArchive: PropTypes.func,
  getHashtags: PropTypes.func,
  getActions: PropTypes.func,
}
