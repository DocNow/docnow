import { SET_TRENDS } from '../actions/trends'

const initialState = []

export default function trends(state = initialState, action) {
  switch (action.type) {

    case SET_TRENDS:
      return [ ...action.trends ]

    default:
      return state
  }
}
