import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getImages, getSearch, updateSearch } from '../actions/search'
import { getTweetsByIds, resetTweets } from '../actions/tweets'
import Images from '../components/Insights/Images'
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
  getImages,
  getTweetsByIds,
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

export default connect(mapStateToProps, mapDispatchToProps)(Images)
