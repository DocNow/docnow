import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Trends from '../components/Trends'
import { getPlaces } from '../actions/trends'
import { updateNewPlace, saveUserPlaces, deleteUserPlace } from '../actions/places'

const mapStateToProps = (state) => {
  const placeLabelToId = label => {
    if (state.places.placesByName[label]) {
      return state.places.placesByName[label][0].id
    }
    return undefined
  }

  const placeIdToLabel = id => {
    for (const place of Object.values(state.places.placesByName)) {
      if (place[0].id === id) {
        return place[0].name
      }
    }
  }

  return {
    places: state.trends.places,
    userLoggedIn: state.user.twitterScreenName !== '',
    placesByName: state.places.placesByName || {},
    newPlace: state.places.newPlace,
    placeIdToLabel,
    placeLabelToId
  }
}

const actions = {
  getPlaces,
  updateNewPlace,
  savePlaces: saveUserPlaces,
  deletePlace: deleteUserPlace
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Trends)
