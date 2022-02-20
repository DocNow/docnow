import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getSearch, getTweets, getUsers, resetTwitterSearch } from '../actions/search'
import { getFoundInSearches, getUserTweetsInSearch, setConsentActions, revokeConsent } from '../actions/user'
import { getTweetsForUser } from '../actions/tweets'

import Collection from '../components/Collections/Collection'

const mapStateToProps = (state, ownProps) => {
  
  return {
    foundUserTweets: state.tweets,
    user: state.user,
    searchId: ownProps.match.params.searchId,
    search: state.search,
    randomTweets: state.randomTweets
  }
}

const actions = {
  getSearch,
  getTweets,
  getUsers,
  getFoundInSearches,
  getTweetsForUser,
  getUserTweetsInSearch,
  setConsentActions,
  revokeConsent,
  resetTwitterSearch
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Collection)
