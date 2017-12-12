import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getWebpages, resetWebpages, selectWebpage, deselectWebpage,
         checkArchive, saveArchive } from '../actions/webpages'
import { getQueueStats } from '../actions/queue'
import { getSearch, updateSearch } from '../actions/search'
import { getTweetsForUrl, resetTweets } from '../actions/tweets'
import Webpages from '../components/Insights/Webpages'

const mapStateToProps = (state, ownProps) => {
  return {
    searchId: ownProps.match.params.searchId,
    search: state.search,
    webpages: state.webpages,
    total: state.queue.total,
    remaining: state.queue.remaining,
    tweets: state.tweets,
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

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Webpages)
