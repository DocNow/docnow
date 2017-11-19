import { SET_SEARCHES } from '../actions/searches'

const initialState = []

export default function settings(state = initialState, action) {
  switch (action.type) {

    case SET_SEARCHES: {
      return action.searches
    }

    default: {
      return state
    }

  }
}
