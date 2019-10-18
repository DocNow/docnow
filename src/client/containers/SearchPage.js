import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Search from '../components/Explore/Search'
import { createSearch, getSearch, getTweets, getUsers, getHashtags,
  getUrls, getImages, getVideos, refreshSearch, updateSearch, activateSearch,
  updateSearchTerm, addSearchTerm, focusSearchTerm, resetTwitterSearch, saveSearch } from '../actions/search'

const mapStateToProps = (state) => {
  return {
    searchId: state.search.id,
    query: state.search.query,
    tweets: state.search.tweets,
    hashtags: state.search.hashtags,
    users: state.search.users,
    urls: state.search.urls,
    images: state.search.images,
    videos: state.search.videos,
    maxDate: state.search.maxDate,
    minDate: state.search.minDate,
    active: state.search.active,
    tweetCount: state.search.tweetCount,
  }
}

const actions = {
  createSearch,
  getSearch,
  getTweets,
  getUsers,
  getHashtags,
  getUrls,
  getImages,
  getVideos,
  refreshSearch,
  updateSearch,
  activateSearch,
  updateSearchTerm,
  addSearchTerm,
  focusSearchTerm,
  resetTwitterSearch,
  saveSearch,
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Search)
