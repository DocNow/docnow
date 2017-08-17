import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import UserList from '../components/UserList'
import { getUsers } from '../actions/search'

const mapStateToProps = (state) => {
  return {
    users: state.search.users || [],
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({getUsers}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(UserList)
