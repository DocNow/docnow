import * as types from '../constants/ActionTypes'

export const getTrends = () => {
  return {
    type: types.GET_TRENDS
  }
  /*
  return (dispatch, getState) => {
    fetch('/api/v1/trends')
      .then(resp => resp.json())
      .then(result => {
        dispatch({
          type: types.SET_TRENDS,
          trends: result.places
        })
      })
  }
  */
}

export const setTrends = (trends) => {
  return {
    type: types.SET_TRENDS,
    trends: trends
  }
}
