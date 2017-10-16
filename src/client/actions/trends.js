export const SET_TRENDS = 'SET_TRENDS'
export const GET_TRENDS = 'GET_TRENDS'
export const NEW_TREND = 'NEW_TREND'
export const REMOVE_TREND = 'REMOVE_TREND'
export const SAVE_TRENDS = 'SAVE_TRENDS'
export const SET_WORLD = 'SET_WORLD'

import { getUser } from './user'

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
        dispatch(updateNewTrend(''))
        dispatch(getTrends())
        dispatch(getUser())
      })
  }
}

export const deleteTrend = (value) => {
  return (dispatch) => {
    dispatch(removeTrend(value))
    dispatch(saveTrends())
  }
}

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
        const world = Object.values(result).reduce((acc, place) => {
          if (!acc[place.name]) {
            acc[place.name] = [place]
          } else {
            acc[place.name].push(place)
          }
          return acc
        }, {})
        Object.keys(world).map(placeName => {
          if (world[placeName].length > 1) {
            world[placeName].forEach(place => {
              const fullName = place.name + ', ' + place.countryCode
              world[fullName] = [place]
            })
            delete world[placeName]
          }
        }, {})
        dispatch(setWorld(world))
      })
  }
}
