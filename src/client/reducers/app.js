import SET_USER from '../actions/app'

const initialState = {
  twitterUsername: ''
}

export default function app(state = initialState, action) {
  switch (action.type) {

    case SET_USER: {
      return {
        ...state,
        twitterUsername: action.twitterUsername
      }
    }

    default: {
      return state
    }
  }
}
