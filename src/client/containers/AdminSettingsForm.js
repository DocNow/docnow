import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import AdminSettings from '../components/AdminSettings'
import { updateSettings, saveSettings, postLogo } from '../actions/settings'

const mapStateToProps = (state) => {
  return {
    user: state.user,
    appKey: state.settings.appKey,
    appSecret: state.settings.appSecret,
    logoUrl: state.settings.logoUrl,
    instanceTitle: state.settings.instanceTitle || ''
  }
}

const actions = {
  saveSettings,
  postLogo
}

const mapDispatchToProps = (dispatch) => {
  return Object.assign( bindActionCreators(actions, dispatch), {
    updateSettings: (e) => {
      dispatch(updateSettings(e.target.name, e.target.value))
    },
  })
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminSettings)
