export const SET_WEBPAGES = 'SET_WEBPAGES'
export const RESET_WEBPAGES = 'RESET_WEBPAGES'
export const SELECT_WEBPAGE = 'SELECT_WEBPAGE'
export const DESELECT_WEBPAGE = 'DESELECT_WEBPAGE'

export const setWebpages = (webpages) => {
  return {
    type: SET_WEBPAGES,
    webpages: webpages
  }
}

export const resetWebpages = () => {
  return {
    type: RESET_WEBPAGES
  }
}

export const getWebpages = (searchId) => {
  return (dispatch) => {
    fetch(`/api/v1/search/${searchId}/webpages`, {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setWebpages(result))
      })
  }
}

export const selectWebpage = (searchId, url) => {
  return (dispatch) => {
    dispatch({
      type: SELECT_WEBPAGE,
      searchId,
      url
    })
    const opts = {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({url: url, selected: true}),
      credentials: 'same-origin'
    }
    fetch(`/api/v1/search/${searchId}/webpages`, opts)
  }
}

export const deselectWebpage = (searchId, url) => {
  return (dispatch) => {
    dispatch({
      type: DESELECT_WEBPAGE,
      searchId,
      url
    })
    const opts = {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({url: url, deselected: true}),
      credentials: 'same-origin'
    }
    fetch(`/api/v1/search/${searchId}/webpages`, opts)
  }
}
