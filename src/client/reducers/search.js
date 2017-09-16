import {
  SET_TWITTER_SEARCH, SET_TWITTER_SEARCH_TWEETS, SET_TWITTER_SEARCH_USERS,
  SET_TWITTER_SEARCH_HASHTAGS, SET_TWITTER_SEARCH_SUMMARY, RESET_SEARCH
} from '../actions/search'

const initialState = {
  searchInfo: {},
  tweets: [],
  users: [],
  hashtags: []
}

export default function user(state = initialState, action) {
  switch (action.type) {

    case SET_TWITTER_SEARCH: {
      return {
        ...state,
        searchInfo: action.searchInfo
      }
    }

    case RESET_SEARCH: {
      return {
        searchInfo: {},
        tweets: [],
        users: [],
        hashtags: []
      }
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

    case SET_TWITTER_SEARCH_SUMMARY: {
      return {
        ...state,
        searchInfo: action.summary
      }
    }

    default: {
      return state
    }
  }
}
