import { SET_SETTINGS, UPDATE_SETTINGS } from '../actions/settings'

const initialState = {
  appKey: '',
  appSecret: ''
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

    default: {
      return state
    }
  }
}
