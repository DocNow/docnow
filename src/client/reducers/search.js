import {
  SET_TWITTER_SEARCH, SET_TWITTER_SEARCH_TWEETS, SET_TWITTER_SEARCH_USERS,
  SET_TWITTER_SEARCH_HASHTAGS, SET_TWITTER_SEARCH_URLS, SET_TWITTER_SEARCH_IMAGES,
  SET_TWITTER_SEARCH_VIDEOS, SET_TWITTER_SEARCH_ACTIONS, RESET_TWITTER_SEARCH, 
  ACTIVATE_SEARCH, UPDATE_SEARCH_TERM, REMOVE_SEARCH_TERM, ADD_SEARCH_TERM, 
  FOCUS_SEARCH_TERM
} from '../actions/search'

const initialState = {
  id: '',
  creator: '',
  title: '',
  description: '',
  query: [],
  created: '',
  minDate: '',
  maxDate: '',
  active: false,
  tweets: [],
  users: [],
  hashtags: [],
  images: [],
  videos: [],
  urls: [],
  actions: [],
  queryUpdated: false,
  tweetCount: 0,
  userCount: 0,
  videoCount: 0,
  imageCount: 0,
  urlCount: 0
}

export default function search(state = initialState, action) {
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
          // Focus previous term as result of removing this one
          const focused = pos === action.term.pos - 1 
            ? { atStart: false }
            : null
          newQuery.push({
            type: term.type,
            value: term.value,
            focused,
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
      // Clean up terms before adding a new one
      const cleanedQuery = state.query.filter(term => !term.value.match(/^\s+$/))
      return {
        ...state,
        queryUpdated: true,
        query: [
          ...cleanedQuery,
          action.term
        ]
      }
    }

    case FOCUS_SEARCH_TERM: {
      if (action.pos >= 0 && action.pos < state.query.length) {
        const focusedQuery = state.query.map((term, i) => {
          let newTerm = term
          if (i === action.pos) {
            newTerm = {...term}
            newTerm.focused = {atStart: action.atStart}
          }
          return newTerm
        })
        return {
          ...state,
          queryUpdated: false,
          query: [...focusedQuery]
        }
      }
      return state
    }

    case SET_TWITTER_SEARCH_ACTIONS: {
      return {
        ...state,
        actions: action.actions
      }
    }

    default: {
      return state
    }
  }
}