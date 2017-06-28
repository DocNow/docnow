export const SET_TRENDS = 'SET_TRENDS'
export const GET_TRENDS = 'GET_TRENDS'

export const setPlaces = (places) => {
  return {
    type: SET_TRENDS,
    places: places
  }
}

export const getPlaces = () => {
  return (dispatch) => {
    fetch('/api/v1/trends', {credentials: 'same-origin'})
      .then(resp => resp.json())
      .then(result => {
        dispatch(setPlaces(result))
      })
  }
}
