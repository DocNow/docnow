import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import UserList from '../components/UserList'
import { getUsers, updateUser } from '../actions/users'

const mapStateToProps = (state) => {
  return {
    users: state.users
  }
}

const actions = {
  getUsers,
  updateUser
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(UserList)
