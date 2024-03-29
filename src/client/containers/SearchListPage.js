import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import SearchList from '../components/SearchList'
import { updateSearch, deleteSearch } from '../actions/search'
import { getSearches, getSearchesCounts } from '../actions/searches'

const mapStateToProps = (state, ownProps) => {
  return {
    searches: state.searches,
    user: state.user,
    forUserId: ownProps.match.params.userId,
    instanceTweetText: state.settings.instanceTweetText,
    academic: state.settings.academic
  }
}

const actions = {
  getSearches,
  updateSearch,
  deleteSearch,
  getSearchesCounts
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(SearchList)
