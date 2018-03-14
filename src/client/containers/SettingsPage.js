import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import Settings from '../components/Settings'
import { getSettings, updateSettings, saveSettings } from '../actions/settings'
import { getSystemStats } from '../actions/stats'

const mapStateToProps = (state) => {
  return {
    instanceTitle: state.settings.instanceTitle,
    logoUrl: state.settings.logoUrl,
    appKey: state.settings.appKey,
    appSecret: state.settings.appSecret,
    userLoggedIn: state.user.twitterScreenName !== '',
    tweetCount: state.stats.tweetCount,
    twitterUserCount: state.stats.twitterUserCount,
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
