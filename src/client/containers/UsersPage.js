import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getUsers, getSearch, updateSearch } from '../actions/search'
import { getTweetsForUser, resetTweets } from '../actions/tweets'
import Users from '../components/Insights/Users'
import { push } from 'connected-react-router'

const mapStateToProps = (state, ownProps) => {
  return {
    searchId: ownProps.match.params.searchId,
    search: state.search,
    tweets: state.tweets,
    location: state.router.location.pathname,
  }
}

const actions = {
  getSearch,
  getUsers,
  getTweetsForUser,
  resetTweets,
  updateSearch,
}

const mapDispatchToProps = (dispatch) => {
  return Object.assign( bindActionCreators(actions, dispatch), {
    navigateTo: (location) => {
      dispatch(push(location))
    }
  })
}

export default connect(mapStateToProps, mapDispatchToProps)(Users)
