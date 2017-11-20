import { SET_WEBPAGES, RESET_WEBPAGES } from '../actions/webpages'

const initialState = []

export default function savedSearch(state = initialState, action) {

  switch (action.type) {

    case SET_WEBPAGES: {
      return action.webpages
    }

    case RESET_WEBPAGES: {
      return initialState
    }

    default: {
      return state
    }

  }

}
