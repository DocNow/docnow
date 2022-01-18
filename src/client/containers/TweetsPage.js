import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getTweets, getSearch, updateSearch } from '../actions/search'
import Tweets from '../components/Insights/Tweets'
import { push } from 'connected-react-router'

const mapStateToProps = (state, ownProps) => {
  return {
    searchId: parseInt(ownProps.match.params.searchId, 10),
    search: state.search,
    user: state.user,
    tweets: state.tweets,
    location: state.router.location.pathname,
    instanceTweetText: state.settings.instanceTweetText,
    academic: state.settings.academic
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
