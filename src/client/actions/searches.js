export const SET_SEARCHES = 'SET_SEARCHES'

export const setSearches = (searches) => {
  return {
    type: SET_SEARCHES,
    searches
  }
}

export const getSearches = (userId) => {
  return (dispatch) => {
    let url = '/api/v1/searches'
    if (userId) {
      url += `?userId=${userId}`
    }
    fetch(url, {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setSearches(result))
      })
  }
}

export const getPublicSearches = () => {
  return (dispatch) => {
    const url = '/api/v1/searches?public=true'
    fetch(url, {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setSearches(result))
      })
   }
}
