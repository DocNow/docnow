import { connect } from 'react-redux'
import Header from '../components/Header'
import { getUser } from '../actions/user'
import { push } from 'connected-react-router'

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

const mapDispatchToProps = (dispatch) => {
  return {
    getUser,
    navigateTo: (location) => {
      dispatch(push(location))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)
