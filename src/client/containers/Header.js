import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Header from '../components/Header'
import { getUser } from '../actions/user'

const mapStateToProps = (state) => {
  return {
    twitterScreenName: state.user.twitterScreenName,
    twitterAvatarUrl: state.user.twitterAvatarUrl,
    isSuperUser: state.user.isSuperUser,
    location: state.router.location.pathname,
    logoUrl: state.settings.logoUrl,
    notifications: 0
  }
}

const actions = {
  getUser: getUser
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Header)
