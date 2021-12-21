export const SET_TWITTER_SEARCH = 'SET_TWITTER_SEARCH'
export const SET_TWITTER_SEARCH_TWEETS = 'SET_TWITTER_SEARCH_TWEETS'
export const SET_TWITTER_SEARCH_USERS = 'SET_TWITTER_SEARCH_USERS'
export const SET_TWITTER_SEARCH_HASHTAGS = 'SET_TWITTER_SEARCH_HASHTAGS'
export const SET_TWITTER_SEARCH_URLS = 'SET_TWITTER_SEARCH_URLS'
export const SET_TWITTER_SEARCH_IMAGES = 'SET_TWITTER_SEARCH_IMAGES'
export const SET_TWITTER_SEARCH_VIDEOS = 'SET_TWITTER_SEARCH_VIDEOS'
export const SET_TWITTER_SEARCH_ACTIONS = 'SET_TWITTER_SEARCH_ACTIONS'
export const RESET_TWITTER_SEARCH = 'RESET_TWITTER_SEARCH'
export const ACTIVATE_SEARCH = 'ACTIVATE_SEARCH'
export const UPDATE_SEARCH_TERM = 'UPDATE_SEARCH_TERM'
export const REMOVE_SEARCH_TERM = 'REMOVE_SEARCH_TERM'
export const ADD_SEARCH_TERM = 'ADD_SEARCH_TERM'
export const FOCUS_SEARCH_TERM = 'FOCUS_SEARCH_TERM'
export const DELETE_SEARCH = 'DELETE_SEARCH'
export const ADD_SEARCH = 'ADD_SEARCH'

import { push } from 'connected-react-router'
import { setMessage } from './message'

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

const setTwitterSearchUrls = (urls) => {
  return {
    type: SET_TWITTER_SEARCH_URLS,
    urls
  }
}

const setTwitterSearchImages = (images) => {
  return {
    type: SET_TWITTER_SEARCH_IMAGES,
    images
  }
}

const setTwitterSearchVideos = (videos) => {
  return {
    type: SET_TWITTER_SEARCH_VIDEOS,
    videos
  }
}

export const resetTwitterSearch = () => {
  return {
    type: RESET_TWITTER_SEARCH
  }
}

export const activateSearch = () => {
  return {
    type: ACTIVATE_SEARCH
  }
}

export const updateSearchTerm = (term) => {
  if (term.value.match(/^\s*$/) && term.pos > 0) {
    return {
      type: REMOVE_SEARCH_TERM,
      term
    }
  } else {
    return {
      type: UPDATE_SEARCH_TERM,
      term
    }
  }
}

export const addSearchTerm = (term) => {
  return {
    type: ADD_SEARCH_TERM,
    term
  }
}

export const focusSearchTerm = (pos, atStart) => {
  return {
    type: FOCUS_SEARCH_TERM,
    pos,
    atStart
  }
}

export const createSearch = (query) => {

  // clean up any new input in the query
  const newQuery = []
  for (const term of query) {
    const value = term.value.trim()
    let type = null
    if (value === '') {
      continue
    } else if (value[0] === '@') {
      type = 'user'
    } else if (value[0] === '#') {
      type = 'hashtag'
    } else if (value.match(/ /)) {
      type = 'phrase'
    } else {
      type = 'keyword'
    }
    newQuery.push({value, type})
  }

  return (dispatch, getState) => {
    dispatch(resetTwitterSearch())
    dispatch(activateSearch())
    const { user } = getState()
    const body = {user, query: newQuery}
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
          dispatch(push('/explore/'))
        })
      })
  }
}

export const updateSearch = (search) => {
  return (dispatch) => {

    dispatch(setTwitterSearch(search))
    const opts = {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(search),
      credentials: 'same-origin'
    }
    const url = `/api/v1/search/${search.id}`
    return fetch(url, opts)
      .then(resp => resp.json().then(result => {
        if (resp.status == 200) {
          dispatch(setTwitterSearch(result))
        } else {
          dispatch(setMessage(result.error))
          delete result.error
          dispatch(setTwitterSearch(result))
        }
      }))
  }
}

export const addSearch = (search) => {
  return {
    type: ADD_SEARCH,
    search
  }
}

export const saveSearch = (search) => {
  return (dispatch) => {
    const opts = {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      credentials: 'same-origin',
      body: JSON.stringify({
        ...search,
        saved: true
      })
    }
    const url = `/api/v1/search/${search.id}`
    return fetch(url, opts)
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(addSearch(result))
        dispatch(push('/searches/'))
      })
  }

}

export const refreshSearch = (search) => {
  return (dispatch) => {
    dispatch(activateSearch())
    const opts = {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(search),
      credentials: 'same-origin'
    }
    const url = `/api/v1/search/${search.id}?refreshTweets=true`
    return fetch(url, opts)
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setTwitterSearch(result))
      })
  }
}

export const deleteSearch = (search) => {
  return (dispatch) => {
    dispatch({
      type: DELETE_SEARCH,
      search
    })
    const opts = {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(search),
      credentials: 'same-origin'
    }
    const url = `/api/v1/search/${search.id}`
    fetch(url, opts)
  }
}

export const getTweets = (id, includeRetweets = false, offset = 0) => {
  return (dispatch) => {
    fetch(`/api/v1/search/${id}/tweets?offset=${offset}&includeRetweets=${includeRetweets}`, {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setTwitterSearchTweets(result))
      })
  }
}

export const getUsers = (id, offset = 0) => {
  return (dispatch) => {
    fetch(`/api/v1/search/${id}/users?offset=${offset}`, {credentials: 'same-origin'})
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

export const getUrls = (id) => {
  return (dispatch) => {
    fetch('/api/v1/search/' + id + '/urls', {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setTwitterSearchUrls(result))
      })
  }
}

export const getImages = (id) => {
  return (dispatch) => {
    fetch('/api/v1/search/' + id + '/images', {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setTwitterSearchImages(result))
      })
  }
}

export const getVideos = (id) => {
  return (dispatch) => {
    fetch('/api/v1/search/' + id + '/videos', {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setTwitterSearchVideos(result))
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

export const createArchive = (search) => {
  return (dispatch) => {
    const newSearch = {id: search.id, archiveStarted: true}
    dispatch(updateSearch(newSearch))
  }
}

export const getActions = (searchId, all) => {
  return async dispatch => {
    let url = `/api/v1/search/${searchId}/actions`
    if (all) {
      url += '?all=true'
    }
    const resp = await fetch(url, {credentials: 'same-origin'})
    const actions = await resp.json()
    dispatch({
      type: SET_TWITTER_SEARCH_ACTIONS,
      searchId: searchId,
      actions: actions
    })
  }
}
