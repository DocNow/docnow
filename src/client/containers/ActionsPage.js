import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getSearch, getActions, updateSearch } from '../actions/search'
import Actions from '../components/Insights/Actions'
import { push } from 'connected-react-router'

const mapStateToProps = (state, ownProps) => {
  return {
    searchId: parseInt(ownProps.match.params.searchId, 10),
    search: state.search,
    user: state.user,
    instanceTweetText: state.settings.instanceTweetText
  }
}

const actions = {
  getSearch,
  updateSearch,
  getActions
}

const mapDispatchToProps = (dispatch) => {
  return Object.assign( bindActionCreators(actions, dispatch), {
    navigateTo: (location) => {
      dispatch(push(location))
    }
  })
}

export default connect(mapStateToProps, mapDispatchToProps)(Actions)