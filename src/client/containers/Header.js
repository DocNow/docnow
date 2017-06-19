import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Header from '../components/Header'
import * as actions from '../actions/settings'

const mapStateToProps = (state) => {
  return {
    username: state.settings.twitterUsername
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Header)
