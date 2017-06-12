// import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import AppSettings from '../components/AppSettings'
// import * as actions from '../actions/a'

const mapStateToProps = (state) => {
  return {
    test: state.test
  }
}

// const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)
const mapDispatchToProps = null

export default connect(mapStateToProps, mapDispatchToProps)(AppSettings)
