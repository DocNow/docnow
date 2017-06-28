import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Settings from '../components/Profile'
import { getPlaces, updateNewPlace, savePlaces } from '../actions/user'

const mapStateToProps = (state) => {
  return {
    user: state.user,
    places: state.user.places,
    newPlace: state.user.newPlace
  }
}

const actions = {
  getPlaces,
  savePlaces
}

const mapDispatchToProps = (dispatch) => {
  return Object.assign( bindActionCreators(actions, dispatch), {
    updateNewPlace: (e) => {
      dispatch(updateNewPlace(e.target.value))
    }
  })
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
