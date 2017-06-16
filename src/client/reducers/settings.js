import { SET_KEYS } from '../actions/settings'

const initialState = {
  appKey: null,
  appSecret: null
}

export default function settings(state = initialState, action) {
  switch (action.type) {

  case SET_KEYS:
    return {
      ...state,
      appKey: action.appKey,
      appSecret: action.appSecret
    }

  default:
    return state
  }
}
