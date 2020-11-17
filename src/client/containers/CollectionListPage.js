import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import CollectionList from '../components/Collections/CollectionList'
import { getSearches } from '../actions/searches'

const mapStateToProps = (state, ownProps) => {
  return {
    settings: state.settings,
    searches: state.searches,
    forUserId: ownProps.match.params.userId,
  }
}

const actions = {
  getSearches  
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(CollectionList)
