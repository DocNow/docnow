import { SET_SETTINGS, UPDATE_SETTINGS, SAVE_SETTINGS } from '../actions/settings'

const initialState = {
  instanceTitle: '',
  appKey: '',
  appSecret: '',
  updated: false
}

export default function settings(state = initialState, action) {
  switch (action.type) {

    case SET_SETTINGS: {
      return {
        ...state,
        instanceTitle: action.instanceTitle,
        appKey: action.appKey,
        appSecret: action.appSecret
      }
    }

    case UPDATE_SETTINGS: {
      const s = {
        ...state,
        updated: true
      }
      s[action.name] = action.value
      return s
    }

    case SAVE_SETTINGS: {
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
