export const SET_SEARCHES = 'SET_SEARCHES'
export const SET_SEARCHES_COUNTS = 'SET_SEARCHES_COUNTS'

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

export const getSearchesCounts = searchIds => {
  return (dispatch) => {
    const url = `/api/v1/counts?searchIds=${searchIds.join(",")}`
    fetch(url, {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch({
          type: SET_SEARCHES_COUNTS,
          searches: result
        })
      })
  }
}