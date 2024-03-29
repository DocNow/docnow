import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getWebpages, resetWebpages, selectWebpage, deselectWebpage,
         checkArchive, saveArchive } from '../actions/webpages'
import { getQueueStats } from '../actions/queue'
import { getSearch, updateSearch } from '../actions/search'
import { getTweetsForUrl, resetTweets } from '../actions/tweets'
import Webpages from '../components/Insights/Webpages'
import { push } from 'connected-react-router'

const mapStateToProps = (state, ownProps) => {
  return {
    searchId: parseInt(ownProps.match.params.searchId, 10),
    search: state.search,
    user: state.user,
    webpages: state.webpages,
    total: state.queue.total,
    remaining: state.queue.remaining,
    tweets: state.tweets,
    instanceTweetText: state.settings.instanceTweetText,
    academic: state.settings.academic
  }
}

const actions = {
  getSearch,
  getWebpages,
  resetWebpages,
  getQueueStats,
  getTweetsForUrl,
  resetTweets,
  selectWebpage,
  deselectWebpage,
  checkArchive,
  saveArchive,
  updateSearch,
}

const mapDispatchToProps = (dispatch) => {
  return Object.assign( bindActionCreators(actions, dispatch), {
    navigateTo: (location) => {
      dispatch(push(location))
    }
  })
}

export default connect(mapStateToProps, mapDispatchToProps)(Webpages)
