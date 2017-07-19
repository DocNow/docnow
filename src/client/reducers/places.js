import { SET_PLACES, SET_WORLD, UPDATE_NEW_PLACE, REMOVE_PLACE } from '../actions/places'

const initialState = {
  places: [],
  newPlace: ''
}

export default function user(state = initialState, action) {
  switch (action.type) {

    case SET_WORLD: {
      const placesByName = Object.values(action.world).reduce((acc, place) => {
        if (!acc[place.name]) {
          acc[place.name] = [place]
        } else {
          acc[place.name].push(place)
        }
        return acc
      }, {})
      Object.keys(placesByName).map(placeName => {
        if (placesByName[placeName].length > 1) {
          placesByName[placeName].forEach(place => {
            const fullName = place.name + ', ' + place.countryCode
            placesByName[fullName] = [place]
          })
          delete placesByName[placeName]
        }
      }, {})
      return {
        ...state,
        placesByName
      }
    }

    case SET_PLACES: {
      return {
        ...state,
        places: action.places,
        newPlace: ''
      }
    }

    case UPDATE_NEW_PLACE: {
      return {
        ...state,
        newPlace: action.id
      }
    }

    case REMOVE_PLACE: {
      const places = state.places.filter((place)=>{
        return place !== action.id
      })
      return {
        ...state,
        places
      }
    }

    default: {
      return state
    }
  }
}
