import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Profile from '../components/Profile'
import { saveSettings } from '../actions/settings'
import { updateUserSettings, saveUserSettings } from '../actions/user'

const mapStateToProps = (state) => {
  return {
    user: state.user,
    updatedSettings: state.settings.updated
  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { updatedSettings } = stateProps
  const { dispatchSave } = dispatchProps

  return {
    ...ownProps, ...stateProps, ...dispatchProps,
    saveAllSettings: () => {
      if (updatedSettings) {
        dispatchSave(saveSettings)
      }
      dispatchSave(saveUserSettings)
    }
  }
}

const mapDispatchToProps = (dispatch) => {
  return Object.assign( bindActionCreators({}, dispatch), {
    updateUserSettings: (e) => {
      const name = e.target.name
      const value = e.target.type == 'checkbox' ? e.target.checked : e.target.value
      dispatch(updateUserSettings(name, value))
    },
    dispatchSave: (save) => {
      dispatch(save())
    }
  })
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Profile)
