import { SET_USER, UPDATE_USER_SETTINGS, SAVE_USER_SETTINGS } from '../actions/user'

const initialState = {
  twitterScreenName: '',
  twitterAvatarUrl: '',
  places: [],
  newPlace: '',
  email: ''
}

export default function user(state = initialState, action) {
  switch (action.type) {

    case SET_USER: {
      return {
        ...state,
        ...action.user
      }
    }

    case UPDATE_USER_SETTINGS: {
      const s = {
        ...state,
        updated: true
      }
      s[action.name] = action.value
      return s
    }

    case SAVE_USER_SETTINGS: {
      return {
        ...state,
        updated: !action.saved
      }
    }

    default: {
      return state
    }
  }
}
