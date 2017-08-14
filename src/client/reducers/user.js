import {
  SET_USER, UPDATE_USER_SETTINGS, SAVE_USER_SETTINGS, SET_TWITTER_SEARCH
} from '../actions/user'

const initialState = {
  name: '',
  twitterScreenName: '',
  twitterAvatarUrl: '',
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

    case SET_TWITTER_SEARCH: {
      return {
        ...state,
        searchInfo: action.searchInfo
      }
    }

    default: {
      return state
    }
  }
}
