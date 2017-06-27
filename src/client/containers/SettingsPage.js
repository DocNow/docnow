import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Settings from '../components/Settings'
import { getSettings, updateSettings, saveSettings } from '../actions/settings'

const mapStateToProps = (state) => {
  return {
    appKey: state.settings.appKey,
    appSecret: state.settings.appSecret
  }
}

const actions = {
  getSettings: getSettings,
  saveSettings: saveSettings
}

const mapDispatchToProps = (dispatch) => {
  return Object.assign( bindActionCreators(actions, dispatch), {
    updateSettings: (name, value) => {
      dispatch(updateSettings(name, value))
    }
  })
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
