import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getWebpages } from '../actions/webpages'
import { getSearch, resetTwitterSearch, updateSearch, getTweets,
         getUsers, getImages, getVideos, getActions, createArchive, getHashtags, 
         deleteSearch } from '../actions/search'

import Insights from '../components/Insights/Insights'

const mapStateToProps = (state, ownProps) => {
  return {
    searchId: parseInt(ownProps.match.params.searchId, 10),
    search: state.search,
    searches: state.searches,
    user: state.user,
    webpages: state.webpages,
    archived: state.search.archived,
    actions: state.search.actions,
    instanceTweetText: state.settings.instanceTweetText,
    academic: state.settings.academic
  }
}

const actions = {
  getSearch,
  getTweets,
  getUsers,
  getImages,
  getVideos,
  getWebpages,
  getActions,
  resetTwitterSearch,
  updateSearch,
  deleteSearch,
  createArchive,
  getHashtags
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Insights)
