import { SET_USER, SET_PLACES, UPDATE_NEW_PLACE, REMOVE_PLACE } from '../actions/user'

const initialState = {
  twitterScreenName: '',
  twitterAvatarUrl: '',
  places: [],
  newPlace: ''
}

export default function user(state = initialState, action) {
  switch (action.type) {

    case SET_USER: {
      return {
        ...state,
        ...action.user
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
