import { SET_TRENDS } from '../actions/trends'

const initialState = {
  places: []
}

export default function trends(state = initialState, action) {
  switch (action.type) {

    case SET_TRENDS:
      return {
        ...state,
        places: action.places
      }

    default:
      return state
  }
}
