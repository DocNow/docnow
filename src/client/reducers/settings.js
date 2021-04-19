import { SET_SETTINGS, UPDATE_SETTINGS, SAVE_SETTINGS } from '../actions/settings'

const initialState = {
  logoUrl: '',
  instanceTitle: '',
  appKey: '',
  appSecret: '',
  defaultQuota: '',
  instanceInfoLink: '',
  instanceDescription: '',
  instanceTweetText: '',
  updated: false,
}

export default function settings(state = initialState, action) {
  switch (action.type) {

    case SET_SETTINGS: {
      return {
        ...state,
        logoUrl: action.logoUrl,
        logoFile: action.logoFile,
        instanceTitle: action.instanceTitle,
        appKey: action.appKey,
        appSecret: action.appSecret,
        defaultQuota: action.defaultQuota,
        instanceDescription: action.instanceDescription,
        instanceInfoLink: action.instanceInfoLink,
        instanceTweetText: action.instanceTweetText,
        emailHost: action.emailHost,
        emailPort: action.emailPort,
        emailUser: action.emailUser,
        emailPassword: action.emailPassword,
        emailFromAddress: action.emailFromAddress
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
        // flush file from memory
        logoFile: null,
        updated: !action.saved
      }
    }

    default: {
      return state
    }
  }
}
