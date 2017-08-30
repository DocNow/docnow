import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Header from '../components/Header'
import { getUser } from '../actions/user'

const mapStateToProps = (state) => {
  return {
    twitterScreenName: state.user.twitterScreenName,
    twitterAvatarUrl: state.user.twitterAvatarUrl,
    location: state.router.location.pathname
  }
}

const actions = {
  getUser: getUser
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Header)
