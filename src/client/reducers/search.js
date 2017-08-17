import {
  SET_TWITTER_SEARCH, SET_TWITTER_SEARCH_TWEETS, SET_TWITTER_SEARCH_USERS
} from '../actions/search'

export default function user(state = {}, action) {
  switch (action.type) {

    case SET_TWITTER_SEARCH: {
      return {
        ...state,
        searchInfo: action.searchInfo
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

    default: {
      return state
    }
  }
}
