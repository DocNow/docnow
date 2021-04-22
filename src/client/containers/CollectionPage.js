import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getSearch, getTweets, getUsers } from '../actions/search'
import { getFoundInSearches } from '../actions/user'
import { getTweetsForUser } from '../actions/tweets'

import Collection from '../components/Collections/Collection'

const mapStateToProps = (state, ownProps) => {
  return {
    foundUserTweets: state.tweets.length,
    user: state.user,
    searchId: ownProps.match.params.searchId,
    search: state.search,
  }
}

const actions = {
  getSearch,
  getTweets,
  getUsers,
  getFoundInSearches,
  getTweetsForUser
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Collection)
