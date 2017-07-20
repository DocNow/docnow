import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import AdminSettings from '../components/AdminSettings'
import { getPlaces, updateNewPlace, deletePlace, savePlaces } from '../actions/places'
import { updateSettings, saveSettings, postLogo } from '../actions/settings'

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
    user: state.user,
    places: state.places.places,
    placesByName: state.places.placesByName || {},
    newPlace: state.places.newPlace,
    placeLabelToId,
    placeIdToLabel,
    appKey: state.settings.appKey,
    appSecret: state.settings.appSecret,
    logoUrl: state.settings.logoUrl,
    instanceTitle: state.settings.instanceTitle || ''
  }
}

const actions = {
  getPlaces,
  savePlaces,
  saveSettings,
  postLogo
}

const mapDispatchToProps = (dispatch) => {
  return Object.assign( bindActionCreators(actions, dispatch), {
    updateNewPlace: (value) => {
      dispatch(updateNewPlace(value))
    },
    deletePlace: (place) => {
      dispatch(deletePlace(place))
    },
    updateSettings: (e) => {
      dispatch(updateSettings(e.target.name, e.target.value))
    },
  })
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminSettings)
