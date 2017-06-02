import { GET_PLACES } from '../constants/ActionTypes'

const initialState = {
  places: []
}

export default function trends(state = initialState, action) {
  switch (action.type) {
  case GET_PLACES:
    return state
  default:
    return state
  }
}
