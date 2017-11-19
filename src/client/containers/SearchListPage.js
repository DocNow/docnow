import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import SavedSearch from '../components/SearchList'

const mapStateToProps = (state, ownProps) => {
  return {
    searchId: ownProps.match.params.searchId
  }
}

const actions = {
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(SavedSearch)
