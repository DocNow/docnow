import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SearchInfo from './SearchInfo'
import InsightsBody from './InsightsBody'
import Intro from '../Intro'


import style from './Insights.css'

export default class Insights extends Component {

  componentDidMount() {
    this.props.resetTwitterSearch()
    this.fetchData()
    this.timerId = setInterval(() => {
      this.tick()
    }, 10000)
  }

  componentWillUnmount() {
    clearInterval(this.timerId)
    this.props.resetTwitterSearch()
  }

  fetchData() {
    this.props.getSearch(this.props.searchId)
    this.props.getUsers(this.props.searchId)
    this.props.getTweets(this.props.searchId)
    this.props.getImages(this.props.searchId)
    this.props.getVideos(this.props.searchId)
    this.props.getWebpages(this.props.searchId)
    this.props.getHashtags(this.props.searchId)
    this.props.getActions(this.props.searchId, true)
  }

  tick() {
    if (this.props.search.active) {
      this.fetchData()
    }
  }

  render() {

    // don't render until we at least know the title of the search
    if (! this.props.search) {
      return <div />
    }

    return (

      <div className={style.Insights}>
      <Intro>
        {this.props.search.title.toUpperCase()} INSIGHTS OVERVIEW
       </Intro>
       <br />

        <SearchInfo
          search={this.props.search}
          user={this.props.user}
          instanceTweetText={this.props.instanceTweetText}
          academic={this.props.academic}
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
  searchId: PropTypes.number,
  search: PropTypes.object,
  searches: PropTypes.array,
  actions: PropTypes.array,
  user: PropTypes.object,
  instanceTweetText: PropTypes.string,
  academic: PropTypes.bool,
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
