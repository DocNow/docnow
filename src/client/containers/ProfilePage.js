import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Settings from '../components/Profile'
import { getPlaces, updateNewPlace, deletePlace, savePlaces } from '../actions/user'

const mapStateToProps = (state) => {
  const placeLabelToId = label => {
    if (state.user.placesByName[label]) {
      return state.user.placesByName[label][0].id
    }
    return undefined
  }

  const placeIdToLabel = id => {
    for (const place of Object.values(state.user.placesByName)) {
      if (place[0].id === id) {
        return place[0].name
      }
    }
  }

  return {
    user: state.user,
    places: state.user.places,
    placesByName: state.user.placesByName || {},
    newPlace: state.user.newPlace,
    placeLabelToId,
    placeIdToLabel
  }
}

const actions = {
  getPlaces,
  savePlaces
}

const mapDispatchToProps = (dispatch) => {
  return Object.assign( bindActionCreators(actions, dispatch), {
    updateNewPlace: (value) => {
      dispatch(updateNewPlace(value))
    },
    deletePlace: (place) => {
      dispatch(deletePlace(place))
    }
  })
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
