import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getVideos, getSearch, updateSearch } from '../actions/search'
import { getTweetsForVideo, resetTweets } from '../actions/tweets'
import Videos from '../components/Insights/Videos'
import { push } from 'connected-react-router'

const mapStateToProps = (state, ownProps) => {
  return {
    searchId: parseInt(ownProps.match.params.searchId, 10),
    search: state.search,
    user: state.user,
    tweets: state.tweets,
    location: state.router.location.pathname,
    instanceTweetText: state.settings.instanceTweetText,
  }
}

const actions = {
  getSearch,
  getVideos,
  getTweetsForVideo,
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

export default connect(mapStateToProps, mapDispatchToProps)(Videos)
