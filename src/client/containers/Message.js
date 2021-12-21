import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Message from '../components/Message'
import { setMessage, clearMessage } from '../actions/message'

const mapStateToProps = (state) => {
  return {
    message: state.message.message,
    code: state.message.code
  }
}

const actions = {
  setMessage,
  clearMessage
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Message)