import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Hashtags from '../components/Hashtags'
import { getHashtags } from '../actions/search'

const mapStateToProps = (state) => {
  return {
    hashtags: state.search.hashtags || [],
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({getHashtags}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Hashtags)
