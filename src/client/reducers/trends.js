import { GET_TRENDS } from '../constants/ActionTypes'

const initialState = {
  places: [],
  count: 0
}

export default function trends(state = initialState, action) {
  switch (action.type) {
  case GET_TRENDS:
    console.log('got trends: ' + state.count)
    return {
      state,
      count: state.count + 1
    }
  default:
    return state
  }
}
