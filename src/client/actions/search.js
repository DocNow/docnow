export const SET_TWITTER_SEARCH = 'SET_TWITTER_SEARCH'
export const SET_TWITTER_SEARCH_TWEETS = 'SET_TWITTER_SEARCH_TWEETS'
export const SET_TWITTER_SEARCH_USERS = 'SET_TWITTER_SEARCH_USERS'
export const SET_TWITTER_SEARCH_HASHTAGS = 'SET_TWITTER_SEARCH_HASHTAGS'

const setTwitterSearch = (searchInfo) => {
  return {
    type: SET_TWITTER_SEARCH,
    searchInfo
  }
}

const setTwitterSearchTweets = (tweets) => {
  return {
    type: SET_TWITTER_SEARCH_TWEETS,
    tweets
  }
}

const setTwitterSearchUsers = (users) => {
  return {
    type: SET_TWITTER_SEARCH_USERS,
    users
  }
}

const setTwitterSearchHashtags = (hashtags) => {
  return {
    type: SET_TWITTER_SEARCH_HASHTAGS,
    hashtags
  }
}

export const searchTwitter = (q) => {
  return (dispatch, getState) => {
    const { user } = getState()
    const body = { user, q }
    const opts = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
      credentials: 'same-origin'
    }
    return fetch('/api/v1/searches', opts)
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setTwitterSearch(result))
      })
  }
}

export const getTweets = (endpoint) => {
  return (dispatch) => {
    fetch(endpoint, {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setTwitterSearchTweets(result))
      })
  }
}

export const getUsers = (endpoint) => {
  return (dispatch) => {
    fetch(endpoint, {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setTwitterSearchUsers(result))
      })
  }
}

export const getHashtags = (endpoint) => {
  return (dispatch) => {
    fetch(endpoint, {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setTwitterSearchHashtags(result))
      })
  }
}
