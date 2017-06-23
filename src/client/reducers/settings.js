import { SET_SETTINGS, UPDATE_SETTINGS, SET_USER } from '../actions/settings'

const initialState = {
  appKey: '',
  appSecret: '',
  twitterScreenName: '',
  twitterAvatarUrl: ''
}

export default function settings(state = initialState, action) {
  switch (action.type) {

    case SET_SETTINGS: {
      return {
        ...state,
        appKey: action.appKey,
        appSecret: action.appSecret
      }
    }

    case UPDATE_SETTINGS: {
      const s = {
        ...state
      }
      s[action.name] = action.value
      return s
    }

    case SET_USER: {
      return {
        ...state,
        twitterScreenName: action.user.twitterScreenName,
        twitterAvatarUrl: action.user.twitterAvatarUrl
      }
    }

    default: {
      return state
    }
  }
}
