export const SET_WORLD = 'SET_WORLD'
export const SET_PLACES = 'SET_PLACES'
export const UPDATE_NEW_PLACE = 'UPDATE_NEW_PLACE'
export const REMOVE_PLACE = 'REMOVE_PLACE'
export const SAVE_PLACES = 'SAVE_PLACES'

export const setWorld = (world) => {
  return {
    type: SET_WORLD,
    world
  }
}

export const getWorld = () => {
  return (dispatch) => {
    fetch('/api/v1/world', {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setWorld(result))
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

export const removePlace = (value) => {
  return {
    type: REMOVE_PLACE,
    id: value
  }
}

/* THUNKS */

export const savePlaces = (placeId) => {
  return (dispatch, getState) => {
    const { places } = getState()
    const newPlaces = [ ...places.places ]
    if (placeId) {
      newPlaces.push(placeId)
    }
    const opts = {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(newPlaces),
      credentials: 'same-origin'
    }
    fetch('/api/v1/places', opts)
      .then(() => {
        dispatch(getPlaces())
      })
  }
}

export const deletePlace = (value) => {
  return (dispatch) => {
    dispatch(removePlace(value))
    dispatch(savePlaces())
  }
}
