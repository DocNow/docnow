export const SET_TRENDS = 'SET_TRENDS'
export const GET_TRENDS = 'GET_TRENDS'
export const SET_PLACES = 'SET_PLACES'
export const UPDATE_NEW_PLACE = 'UPDATE_NEW_PLACE'
export const REMOVE_PLACE = 'REMOVE_PLACE'
export const SAVE_PLACES = 'SAVE_PLACES'


export const setTrends = (trends) => {
  return {
    type: SET_TRENDS,
    trends
  }
}

export const getTrends = () => {
  return (dispatch) => {
    fetch('/api/v1/trends', {credentials: 'same-origin'})
      .then(resp => resp.json())
      .then(result => {
        dispatch(setTrends(result))
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

export const savePlaces = (placeId) => {
  return (dispatch, getState) => {
    const { trends } = getState()
    const placeIds = trends.places.map((p) => { return p.placeId })

    if (placeId) {
      placeIds.push(placeId)
    }

    const opts = {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(placeIds),
      credentials: 'same-origin'
    }
    fetch('/api/v1/trends', opts)
      .then(() => {
        dispatch(getTrends())
      })
  }
}

export const deletePlace = (value) => {
  return (dispatch) => {
    dispatch(removePlace(value))
    dispatch(savePlaces())
  }
}
