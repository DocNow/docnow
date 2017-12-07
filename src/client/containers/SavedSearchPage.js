import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getWebpages, resetWebpages, selectWebpage, deselectWebpage,
         checkArchive } from '../actions/webpages'
import { getQueueStats } from '../actions/queue'
import { getTweetsForUrl, resetTweets } from '../actions/tweets'
import SavedSearch from '../components/SavedSearch'

const mapStateToProps = (state, ownProps) => {
  return {
    searchId: ownProps.match.params.searchId,
    webpages: state.webpages,
    total: state.queue.total,
    remaining: state.queue.remaining,
    tweets: state.tweets,
  }
}

const actions = {
  getWebpages,
  resetWebpages,
  getQueueStats,
  getTweetsForUrl,
  resetTweets,
  selectWebpage,
  deselectWebpage,
  checkArchive
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(SavedSearch)
