import { SET_MESSAGE, CLEAR_MESSAGE } from '../actions/message'

const initialState = {
  message: null,
  code: null
}

export default function error(state = initialState, action) {
  switch (action.type) {

    case SET_MESSAGE: {
      return {
        message: action.message,
        code: action.code
      }
    }

    case CLEAR_MESSAGE: {
      return {
        message: null,
        code: null
      }
    }

    default: {
      return state
    }

  }
}