export const SET_TWEETS = 'SET_TWEETS'
export const RESET_TWEETS = 'RESET_TWEETS'

export const setTweets = (tweets) => {
  return {
    type: SET_TWEETS,
    tweets
  }
}

export const resetTweets = () => {
  return {
    type: RESET_TWEETS
  }
}

export const getTweetsForUrl = (searchId, url) => {
  return (dispatch) => {
    fetch(`/api/v1/search/${searchId}/tweets?url=${url}`, {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setTweets(result))
      })
  }
}
