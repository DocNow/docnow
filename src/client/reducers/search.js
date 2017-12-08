import {
  SET_TWITTER_SEARCH, SET_TWITTER_SEARCH_TWEETS, SET_TWITTER_SEARCH_USERS,
  SET_TWITTER_SEARCH_HASHTAGS, SET_TWITTER_SEARCH_URLS, SET_TWITTER_SEARCH_IMAGES,
  SET_TWITTER_SEARCH_VIDEOS, RESET_TWITTER_SEARCH, ACTIVATE_SEARCH,
  UPDATE_SEARCH_TERM, REMOVE_SEARCH_TERM, ADD_SEARCH_TERM
} from '../actions/search'

const initialState = {
  id: '',
  creator: '',
  query: [],
  created: '',
  minDate: '',
  maxDate: '',
  action: false,
  tweets: [],
  users: [],
  hashtags: [],
  images: [],
  videos: [],
  urls: [],
  queryUpdated: false
}

export default function user(state = initialState, action) {
  switch (action.type) {

    case SET_TWITTER_SEARCH: {
      if (state.queryUpdated) {
        action.search.queryUpdated = true
        action.search.query = state.query
      }
      return {
        ...state,
        ...action.search
      }
    }

    case RESET_TWITTER_SEARCH: {
      return initialState
    }

    case SET_TWITTER_SEARCH_TWEETS: {
      return {
        ...state,
        tweets: action.tweets
      }
    }

    case SET_TWITTER_SEARCH_USERS: {
      return {
        ...state,
        users: action.users
      }
    }

    case SET_TWITTER_SEARCH_HASHTAGS: {
      return {
        ...state,
        hashtags: action.hashtags
      }
    }

    case SET_TWITTER_SEARCH_URLS: {
      return {
        ...state,
        urls: action.urls
      }
    }

    case SET_TWITTER_SEARCH_IMAGES: {
      return {
        ...state,
        images: action.images
      }
    }

    case SET_TWITTER_SEARCH_VIDEOS: {
      return {
        ...state,
        videos: action.videos
      }
    }

    case ACTIVATE_SEARCH: {
      return {
        ...state,
        active: true
      }
    }

    case UPDATE_SEARCH_TERM: {
      const newQuery = []
      state.query.forEach((term, pos) => {
        if (action.term.pos === pos) {
          newQuery.push({
            type: action.term.type,
            value: action.term.value,
          })
        } else {
          newQuery.push({...term})
        }
      })
      return {
        ...state,
        queryUpdated: true,
        query: newQuery
      }
    }

    case REMOVE_SEARCH_TERM: {
      const newQuery = []
      state.query.forEach((term, pos) => {
        if (action.term.pos !== pos)  {
          newQuery.push({
            type: term.type,
            value: term.value,
            pos: pos
          })
        }
      })
      return {
        ...state,
        queryUpdated: true,
        query: newQuery
      }
    }

    case ADD_SEARCH_TERM: {
      return {
        ...state,
        queryUpdated: true,
        query: [
          ...state.query,
          action.term
        ]
      }
    }

    default: {
      return state
    }
  }
}
