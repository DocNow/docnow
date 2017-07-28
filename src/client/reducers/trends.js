import { SET_TRENDS, UPDATE_NEW_PLACE, REMOVE_PLACE } from '../actions/trends'

const initialState = {
  places: [],
  newPlace: ''
}

export default function trends(state = initialState, action) {
  switch (action.type) {

    case SET_TRENDS:
      return {
        ...state,
        places: action.trends
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

    default:
      return state
  }
}
