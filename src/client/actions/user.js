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
export const SET_FOUND_IN_SEARCHES = 'SET_FOUND_SEARCHES'
export const SET_TWEETS_FOR_USER = 'SET_TWEETS_FOR_USER'

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

export const saveUserSettings = () => {
  return (dispatch, getState) => {
    const { user } = getState()
    console.log(user)
    const opts = {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(user),
      credentials: 'same-origin'
    }
    return fetch('/api/v1/user', opts)
      .then((resp) => {
        dispatch({
          type: SAVE_USER_SETTINGS
        })
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

export const getFoundInSearches = () => {
  return (dispatch) => {
    const url = '/api/v1/findme'
    fetch(url, {credentials: 'same-origin'})
      .then(resp => resp.json())
      .then(searches => {
        dispatch({
          type: SET_FOUND_IN_SEARCHES,
          searches
        })
      })
  }
}

export const getUserTweetsInSearch = searchId => {
  return async dispatch => {

    // it might make sense to move this join into a single API call

    let resp = await fetch(`/api/v1/search/${searchId}/tweets?mine=true`, {credentials: 'same-origin'})
    const tweets = await resp.json()

    resp = await fetch(`/api/v1/search/${searchId}/actions`, {credentials: 'same-origin'})
    const actions = await resp.json()

    for (const tweet of tweets) {
      tweet.consentActions = []
      for (const action of actions) {
        if (action.tweet && action.tweet.tweetId === tweet.id) {
          tweet.consentActions.push(action)
        }
      }
    }

    dispatch({
      type: SET_TWEETS_FOR_USER,
      tweets,
    })
  }
}

export const setConsentActions = (searchId, tweets, label, remove = false) => {
  return async dispatch => {

    const body = {
      action: {
        label: label,
        remove: remove ? true : false
      },
      tweets: tweets
    }

    const opts = {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
      credentials: 'same-origin'
    }

    await fetch(`/api/v1/search/${searchId}/actions`, opts)
    dispatch(getUserTweetsInSearch(searchId))
  }
}

export const revokeConsent = (searchId, tweetIds) => {
  return async dispatch => {

    const body = {
      searchId: searchId,
      tweetIds: tweetIds
    }

    const opts = {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
      credentials: 'same-origin'
    }

    await fetch(`/api/v1/search/${searchId}/tweets`, opts)
    dispatch(getUserTweetsInSearch(searchId))
  }
}
