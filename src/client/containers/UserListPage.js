import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import UserList from '../components/UserList'
import { getUsers } from '../actions/users'
import { setUser } from '../actions/user'

const mapStateToProps = (state) => {
  return {
    users: state.users
  }
}

const actions = {
  getUsers,
  setUser
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(UserList)
