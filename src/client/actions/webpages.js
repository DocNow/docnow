export const SET_WEBPAGES = 'SET_WEBPAGES'
export const RESET_WEBPAGES = 'RESET_WEBPAGES'

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
