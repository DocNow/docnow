export const SET_TRENDS = 'SET_TRENDS'
export const GET_TRENDS = 'GET_TRENDS'

export const setTrends = (places) => {
  return {
    type: SET_TRENDS,
    places: places
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
