import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getWebpages, resetWebpages } from '../actions/webpages'
import { getQueueStats } from '../actions/queue'
import SavedSearch from '../components/SavedSearch'

const mapStateToProps = (state, ownProps) => {
  return {
    searchId: ownProps.match.params.searchId,
    webpages: state.webpages,
    total: state.queue.total,
    remaining: state.queue.remaining
  }
}

const actions = {
  getWebpages,
  resetWebpages,
  getQueueStats
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(SavedSearch)
