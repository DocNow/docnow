import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Search from '../components/Search'
import { searchTwitter, resetSearch } from '../actions/search'

const mapStateToProps = (state, ownProps) => {
  return {
    searchInfo: state.search.searchInfo || {},
    q: ownProps.match.params.q
  }
}

const actions = {
  searchTwitter,
  resetSearch
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Search)
