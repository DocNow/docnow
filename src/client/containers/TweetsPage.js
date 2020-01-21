import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getTweets, getSearch, updateSearch } from '../actions/search'
import Tweets from '../components/Insights/Tweets'
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
  getTweets,
  updateSearch,
}

const mapDispatchToProps = (dispatch) => {
  return Object.assign( bindActionCreators(actions, dispatch), {
    navigateTo: (location) => {
      dispatch(push(location))
    }
  })
}

export default connect(mapStateToProps, mapDispatchToProps)(Tweets)
