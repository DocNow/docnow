import {
  SET_TWITTER_SEARCH, SET_TWITTER_SEARCH_TWEETS, SET_TWITTER_SEARCH_USERS,
  SET_TWITTER_SEARCH_HASHTAGS, SET_TWITTER_SEARCH_URLS,
  RESET_TWITTER_SEARCH
} from '../actions/search'

const initialState = {
  id: '',
  creator: '',
  query: '',
  created: '',
  minDate: '',
  maxDate: '',
  tweets: [],
  users: [],
  hashtags: [],
  urls: []
}

export default function user(state = initialState, action) {
  switch (action.type) {

    case SET_TWITTER_SEARCH: {
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

    default: {
      return state
    }
  }
}
