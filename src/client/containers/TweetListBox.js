import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import TweetList from '../components/TweetList'
import { getTweets } from '../actions/search'

const mapStateToProps = (state) => {
  return {
    id: state.search.id,
    tweets: state.search.tweets || [],
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({getTweets}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(TweetList)
