import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Profile from '../components/Profile'
import { saveSettings } from '../actions/settings'
import { updateUserSettings, saveUserSettings } from '../actions/user'

const mapStateToProps = (state) => {
  return {
    user: state.user,
    updatedSettings: state.settings.updated,
    updatedUserSettings: state.user.updated,
  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { updatedSettings } = stateProps
  const { updatedUserSettings } = stateProps
  const { dispatchSave } = dispatchProps

  return {
    ...ownProps, ...stateProps, ...dispatchProps,
    saveAllSettings: () => {
      if (updatedSettings) {
        dispatchSave(saveSettings)
      }
      if (updatedUserSettings) {
        dispatchSave(saveUserSettings)
      }
    }
  }
}

const mapDispatchToProps = (dispatch) => {
  return Object.assign( bindActionCreators({}, dispatch), {
    updateUserSettings: (e) => {
      dispatch(updateUserSettings(e.target.name, e.target.value))
    },
    dispatchSave: (save) => {
      dispatch(save())
    }
  })
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Profile)
