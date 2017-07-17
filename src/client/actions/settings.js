export const GET_SETTINGS = 'GET_SETTINGS'
export const SET_SETTINGS = 'SET_SETTINGS'
export const UPDATE_SETTINGS = 'UPDATE_SETTINGS'
export const SAVE_SETTINGS = 'SAVE_SETTINGS'


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
        dispatch(setSettings(result.appKey || '', result.appSecret || ''))
      })
  }
}

export const updateSettings = (name, value) => {
  return {
    type: UPDATE_SETTINGS,
    name,
    value
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
    return fetch('/api/v1/settings', opts)
      .then((resp) => resp.json())
  }
}
