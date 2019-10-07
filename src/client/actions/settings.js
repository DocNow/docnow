export const GET_SETTINGS = 'GET_SETTINGS'
export const SET_SETTINGS = 'SET_SETTINGS'
export const UPDATE_SETTINGS = 'UPDATE_SETTINGS'
export const SAVE_SETTINGS = 'SAVE_SETTINGS'

export const setSettings = (settings) => {
  return {
    type: SET_SETTINGS,
    ...settings
  }
}

export const getSettings = () => {
  return (dispatch) => {
    fetch('/api/v1/settings', {credentials: 'same-origin'})
      .then(resp => resp.json())
      .then(result => {
        dispatch(setSettings(result))
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

const saveSettingsAction = () => {
  return {
    type: SAVE_SETTINGS,
    saved: true
  }
}

export const postLogo = () => {
  return (dispatch, getState) => {
    const { settings } = getState()
    const imageFormData = new FormData()
    imageFormData.append('imageFile', settings.logoFile)
    const opts = {
      method: 'POST',
      body: imageFormData,
      credentials: 'same-origin'
    }
    return fetch('/api/v1/logo', opts)
  }
}

export const saveSettings = () => {
  return (dispatch, getState) => {
    const { settings } = getState()
    const opts = {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      credentials: 'same-origin',
      body: JSON.stringify(settings)
    }
    return fetch('/api/v1/settings', opts, )
      .then((resp) => {
        if (settings.logoFile) {
          dispatch(postLogo())
        }
        dispatch(saveSettingsAction())
        resp.json()
      })
  }
}
