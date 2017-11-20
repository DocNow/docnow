import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getWebpages } from '../actions/webpages'
import { getQueueStats } from '../actions/queue'
import SavedSearch from '../components/SavedSearch'

const mapStateToProps = (state, ownProps) => {
  return {
    searchId: ownProps.match.params.searchId,
    webpages: state.webpages
  }
}

const actions = {
  getWebpages,
  getQueueStats
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(SavedSearch)
