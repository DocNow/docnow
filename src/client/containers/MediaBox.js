import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Media from '../components/Media'
import { getTweets } from '../actions/search'

const mapStateToProps = (state) => {
  return {
    tweets: state.search.tweets || [],
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({getTweets}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Media)
