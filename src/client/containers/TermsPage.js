import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Terms from '../components/Terms'
import { updateTerms } from '../actions/terms'
import { saveSettings } from '../actions/settings'
import { saveUserSettings, updateUserSettings } from '../actions/user'

const mapStateToProps = (state) => {
  return {
    isSuperUser: state.user.isSuperUser,
    termsOfService: state.settings.termsOfService,
    agreedTermsOfService: state.user.termsOfService
  }
}

const actions = {
  updateTerms,
  saveTerms: saveSettings,
  updateUserSettings: updateUserSettings,
  saveUserSettings: saveUserSettings
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Terms)
