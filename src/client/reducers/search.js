import {
  SET_TWITTER_SEARCH, SET_TWITTER_SEARCH_TWEETS, SET_TWITTER_SEARCH_USERS,
  SET_TWITTER_SEARCH_HASHTAGS
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
  hashtags: []
}

export default function user(state = initialState, action) {
  switch (action.type) {

    case SET_TWITTER_SEARCH: {
      return {
        ...state,
        ...action.search
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

    default: {
      return state
    }
  }
}
