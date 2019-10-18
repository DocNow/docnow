export const GET_USER = 'GET_USER'
export const SET_USER = 'SET_USER'
export const UPDATE_USER = 'UPDATE_USER'
export const UPDATE_USER_SETTINGS = 'UPDATE_USER_SETTINGS'
export const SAVE_USER_SETTINGS = 'SAVE_USER_SETTINGS'
export const ACTIVATE_USER = 'ACTIVATE_USER'
export const DEACTIVATE_USER = 'DEACTIVATE_USER'
export const ACTIVATE_ADMIN = 'ACTIVATE_ADMIN'
export const DEACTIVATE_ADMIN = 'DEACTIVATE_ADMIN'
export const UPDATE_QUOTA = 'UPDATE_QUOTA'

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

export const updateUser = (user) => {
  return (dispatch) => {
    const opts = {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(user),
      credentials: 'same-origin'
    }
    fetch(`/api/v1/user/${user.id}`, opts)
      .then((resp) => resp.json())
      .then((updatedUser) => {
        dispatch({
          type: UPDATE_USER,
          user: updatedUser
        })
      })
  }
}

export const activateUser = (user) => {
  return (dispatch) => {
    dispatch({
      type: ACTIVATE_USER,
      user: user
    })
    dispatch(updateUser({...user, active: true}))
  }
}

export const deactivateUser = (user) => {
  return (dispatch) => {
    dispatch({
      type: DEACTIVATE_USER,
      user
    })
    dispatch(updateUser({...user, active: false}))
  }
}

export const activateAdmin = (user) => {
  return (dispatch) => {
    dispatch({
      type: ACTIVATE_ADMIN,
      user
    })
    dispatch(updateUser({...user, isSuperUser: true}))
  }
}

export const deactivateAdmin = (user) => {
  return (dispatch) => {
    dispatch({
      type: DEACTIVATE_ADMIN,
      user
    })
    dispatch(updateUser({...user, isSuperUser: false}))
  }
}

export const updateQuota = (user, quota) => {
  return (dispatch) => {
    dispatch({
      type: UPDATE_QUOTA,
      user,
      quota
    })
    dispatch(updateUser({...user, tweetQuota: quota}))
  }
}