export const GET_USER = 'GET_USER'
export const SET_USER = 'SET_USER'
export const GET_PLACES = 'GET_PLACES'
export const SET_PLACES = 'SET_PLACES'
export const UPDATE_NEW_PLACE = 'UPDATE_NEW_PLACE'
export const SAVE_PLACES = 'SAVE_PLACES'

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

export const setPlaces = (places) => {
  return {
    type: SET_PLACES,
    places: places
  }
}

export const getPlaces = () => {
  return (dispatch) => {
    fetch('/api/v1/places', {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setPlaces(result))
      })
  }
}

export const updateNewPlace = (value) => {
  return {
    type: UPDATE_NEW_PLACE,
    id: value
  }
}

export const savePlaces = () => {
  return (dispatch, getState) => {
    const { user } = getState()
    const places = [ ...user.places ]
    if (user.newPlace) {
      places.push(user.newPlace)
    }
    const opts = {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(places),
      credentials: 'same-origin'
    }
    fetch('/api/v1/places', opts)
      .then(() => {
        dispatch(getPlaces())
      })
  }
}
