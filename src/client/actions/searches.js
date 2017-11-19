export const SET_SEARCHES = 'SET_SEARCHES'

export const setSearches = (searches) => {
  return {
    type: SET_SEARCHES,
    searches
  }
}

export const getSearches = () => {
  return (dispatch) => {
    fetch('/api/v1/searches', {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setSearches(result))
      })
  }
}
