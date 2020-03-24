import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getWebpages } from '../actions/webpages'
import { getSearch, resetTwitterSearch, updateSearch, getTweets,
         getUsers, getImages, getVideos, createArchive, getHashtags } from '../actions/search'

import Insights from '../components/Insights/Insights'

const mapStateToProps = (state, ownProps) => {
  return {
    searchId: ownProps.match.params.searchId,
    search: state.search,
    searches: state.searches,
    user: state.user,
    webpages: state.webpages,
    archived: state.search.archived
  }
}

const actions = {
  getSearch,
  getTweets,
  getUsers,
  getImages,
  getVideos,
  getWebpages,
  resetTwitterSearch,
  updateSearch,
  createArchive,
  getHashtags
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Insights)
