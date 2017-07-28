import { SET_WORLD, SET_TRENDS, NEW_TREND, REMOVE_TREND } from '../actions/trends'

const initialState = {
  places: [],
  newPlace: '',
  placesByName: {}
}

export default function trends(state = initialState, action) {
  switch (action.type) {

    case SET_TRENDS:
      return {
        ...state,
        places: action.trends
      }

    case NEW_TREND: {
      return {
        ...state,
        newPlace: action.id
      }
    }

    case REMOVE_TREND: {
      const places = state.places.filter((place)=>{
        return place !== action.id
      })
      return {
        ...state,
        places
      }
    }

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

    default: {
      return state
    }
  }
}
