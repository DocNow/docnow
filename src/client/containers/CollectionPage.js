import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getSearch, getTweets } from '../actions/search'

import Collection from '../components/Collections/Collection'

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user,
    searchId: ownProps.match.params.searchId,
    search: state.search,
  }
}

const actions = {
  getSearch,
  getTweets
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Collection)