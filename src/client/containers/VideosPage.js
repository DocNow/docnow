import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getVideos, getSearch, updateSearch } from '../actions/search'
import { getTweetsForVideo, resetTweets } from '../actions/tweets'
import Videos from '../components/Insights/Videos'
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
