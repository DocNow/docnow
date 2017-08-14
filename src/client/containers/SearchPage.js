import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Search from '../components/Search'
import { searchTwitter } from '../actions/user'

const mapStateToProps = (state, ownProps) => {
  return {
    q: ownProps.match.params.q
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({searchTwitter}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Search)
