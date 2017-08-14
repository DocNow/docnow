export const GET_USER = 'GET_USER'
export const SET_USER = 'SET_USER'
export const UPDATE_USER_SETTINGS = 'UPDATE_USER_SETTINGS'
export const SAVE_USER_SETTINGS = 'SAVE_USER_SETTINGS'
export const SET_TWITTER_SEARCH = 'SET_TWITTER_SEARCH'

export const setUser = (user) => {
  return {
    type: SET_USER,
    user: user
  }
}

export const updateUserSettings = (name, value) => {
  return {
    type: UPDATE_USER_SETTINGS,
    name,
    value
  }
}

const saveUserSettingsAction = () => {
  return {
    type: SAVE_USER_SETTINGS,
    saved: true
  }
}

const setTwitterSearch = (searchInfo) => {
  return {
    type: SET_TWITTER_SEARCH,
    searchInfo
  }
}

export const saveUserSettings = () => {
  return (dispatch, getState) => {
    const { user } = getState()
    const opts = {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(user),
      credentials: 'same-origin'
    }
    return fetch('/api/v1/user', opts)
      .then((resp) => {
        dispatch(saveUserSettingsAction())
        resp.json()
      })
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

export const searchTwitter = (q) => {
  return (dispatch, getState) => {
    const { user } = getState()
    const body = { user, q }
    const opts = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
      credentials: 'same-origin'
    }
    return fetch('/api/v1/searches', opts)
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setTwitterSearch(result))
      })
  }
}
