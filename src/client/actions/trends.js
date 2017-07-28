export const SET_TRENDS = 'SET_TRENDS'
export const GET_TRENDS = 'GET_TRENDS'
export const NEW_TREND = 'NEW_TREND'
export const REMOVE_TREND = 'REMOVE_TREND'
export const SAVE_TRENDS = 'SAVE_TRENDS'
export const SET_WORLD = 'SET_WORLD'

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

export const updateNewTrend = (value) => {
  return {
    type: NEW_TREND,
    id: value
  }
}

export const removeTrend = (value) => {
  return {
    type: REMOVE_TREND,
    id: value
  }
}

export const saveTrends = (placeId) => {
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

export const deleteTrend = (value) => {
  return (dispatch) => {
    dispatch(removeTrend(value))
    dispatch(saveTrends())
  }
}
