export const SET_PLACES = 'SET_PLACES'
export const GET_PLACES = 'GET_PLACES'

export const setPlaces = (places) => {
  return {
    type: SET_PLACES,
    places: places
  }
}

export const getPlaces = () => {
  return (dispatch) => {
    fetch('/api/v1/trends')
      .then(resp => resp.json())
      .then(result => {
        dispatch(setPlaces(result.places))
      })
  }
}
