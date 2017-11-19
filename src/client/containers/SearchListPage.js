import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import SearchList from '../components/SearchList'
import { getSearches } from '../actions/searches'

const mapStateToProps = (state) => {
  return {
    searches: state.searches
  }
}

const actions = {
  getSearches
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(SearchList)
