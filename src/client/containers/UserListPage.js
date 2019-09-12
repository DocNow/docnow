import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import UserList from '../components/UserList'
import { getUsers } from '../actions/users'
import { activateUser, deactivateUser, activateAdmin, deactivateAdmin } from '../actions/user'

const mapStateToProps = (state) => {
  return {
    users: state.users
  }
}

const actions = {
  getUsers,
  activateUser,
  deactivateUser,
  activateAdmin,
  deactivateAdmin
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(UserList)
