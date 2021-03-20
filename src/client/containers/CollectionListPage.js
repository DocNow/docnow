import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import CollectionList from '../components/Collections/CollectionList'
import { getPublicSearches } from '../actions/searches'
import { getFoundInSearches } from '../actions/user'

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user,
    settings: state.settings,
    searches: state.searches,
    forUserId: ownProps.match.params.userId,
  }
}

const actions = {
  getPublicSearches,
  getFoundInSearches  
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(CollectionList)
