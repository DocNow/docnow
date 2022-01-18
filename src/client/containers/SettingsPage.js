import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import Settings from '../components/Settings'
import { getSettings, updateSettings, saveSettings } from '../actions/settings'
import { getSystemStats } from '../actions/stats'

const mapStateToProps = (state) => {
  return {
    instanceTitle: state.settings.instanceTitle,
    logoUrl: state.settings.logoUrl,
    appKey: state.settings.appKey,
    appSecret: state.settings.appSecret,
    defaultQuota: state.settings.defaultQuota,
    instanceInfoLink: state.settings.instanceInfoLink,
    instanceDescription: state.settings.instanceDescription,
    instanceTweetText: state.settings.instanceTweetText,
    academic: state.settings.academic,
    emailHost: state.settings.emailHost,
    emailPort: state.settings.emailPort,
    emailUser: state.settings.emailUser,
    emailPassword: state.settings.emailPassword,
    emailFromAddress: state.settings.emailFromAddress,
    userLoggedIn: state.user.twitterScreenName !== '',
    tweetCount: state.stats.tweetCount,
    userCount: state.stats.userCount,
  }
}

const actions = {
  getSettings,
  saveSettings,
  getSystemStats
}

const mapDispatchToProps = (dispatch) => {
  return Object.assign( bindActionCreators(actions, dispatch), {
    updateSettings: (e) => {
      dispatch(updateSettings(e.target.name, e.target.value))
    },
    returnHome: () => {
      dispatch(push('/'))
    }
  })
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
