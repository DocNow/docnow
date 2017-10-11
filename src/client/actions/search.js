export const SET_TWITTER_SEARCH = 'SET_TWITTER_SEARCH'
export const SET_TWITTER_SEARCH_TWEETS = 'SET_TWITTER_SEARCH_TWEETS'
export const SET_TWITTER_SEARCH_USERS = 'SET_TWITTER_SEARCH_USERS'
export const SET_TWITTER_SEARCH_HASHTAGS = 'SET_TWITTER_SEARCH_HASHTAGS'
export const RESET_TWITTER_SEARCH = 'RESET_TWITTER_SEARCH'

const setTwitterSearch = (search) => {
  return {
    type: SET_TWITTER_SEARCH,
    search
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

const resetTwitterSearch = () => {
  return {
    type: RESET_TWITTER_SEARCH
  }
}

export const searchTwitter = (q) => {
  return (dispatch, getState) => {
    dispatch(resetTwitterSearch())
    const { user } = getState()
    const body = { user, q }
    const opts = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
      redirect: 'follow',
      credentials: 'same-origin'
    }
    return fetch('/api/v1/searches', opts)
      .then((resp) => {
        resp.json().then((result) => {
          dispatch(setTwitterSearch(result))
        })
      })
  }
}

export const updateSearch = (search) => {
  return (dispatch) => {
    const opts = {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(search),
      credentials: 'same-origin'
    }
    return fetch('/api/v1/search/' + search.id, opts)
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setTwitterSearch(result))
      })
  }
}

export const getTweets = (id) => {
  return (dispatch) => {
    fetch('/api/v1/search/' + id + '/tweets', {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setTwitterSearchTweets(result))
      })
  }
}

export const getUsers = (id) => {
  return (dispatch) => {
    fetch('/api/v1/search/' + id + '/users', {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setTwitterSearchUsers(result))
      })
  }
}

export const getHashtags = (id) => {
  return (dispatch) => {
    fetch('/api/v1/search/' + id + '/hashtags', {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setTwitterSearchHashtags(result))
      })
  }
}

export const getSearch = (searchId) => {
  return (dispatch) => {
    const url = '/api/v1/search/' + searchId
    fetch(url, {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setTwitterSearch(result))
      })
  }
}
