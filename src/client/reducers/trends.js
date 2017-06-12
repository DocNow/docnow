import { SET_PLACES } from '../actions/trends'

const initialState = {
  places: []
}

export default function trends(state = initialState, action) {
  switch (action.type) {

  case SET_PLACES:
    return {
      ...state,
      places: action.places
    }

  default:
    return state
  }
}
