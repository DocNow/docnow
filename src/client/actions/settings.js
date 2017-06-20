import { push } from 'react-router-redux'

export const GET_SETTINGS = 'GET_SETTINGS'
export const SET_SETTINGS = 'SET_SETTINGS'
export const UPDATE_SETTINGS = 'UPDATE_SETTINGS'
export const SAVE_SETTINGS = 'SAVE_SETTINGS'
export const GET_USER = 'GET_USER'
export const SET_USER = 'SET_USER'


export const setSettings = (appKey, appSecret) => {
  return {
    type: SET_SETTINGS,
    appKey: appKey,
    appSecret: appSecret
  }
}

export const getSettings = () => {
  return (dispatch) => {
    fetch('/api/v1/settings')
      .then(resp => resp.json())
      .then(result => {
        dispatch(setSettings(result.appKey, result.appSecret))
      })
  }
}

export const updateSettings = (event) => {
  return {
    type: UPDATE_SETTINGS,
    name: event.target.name,
    value: event.target.value
  }
}

export const saveSettings = () => {
  return (dispatch, getState) => {
    const { settings } = getState()
    const opts = {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(settings)
    }
    fetch('/api/v1/settings', opts)
      .then((resp) => resp.json())
      .then(() => dispatch(push('/')))
  }
}

export const setUser = (user) => {
  return {
    type: SET_USER,
    user: user
  }
}

export const getUser = () => {
  return (dispatch) => {
    fetch('/api/v1/user', {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        if (result.id) {
          dispatch(setUser(result))
        }
      })
  }
}
