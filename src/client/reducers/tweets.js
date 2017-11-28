import { SET_TWEETS, RESET_TWEETS } from '../actions/tweets'

const initialState = []

export default function tweets(state = initialState, action) {

  switch (action.type) {

    case SET_TWEETS: {
      return action.tweets
    }

    case RESET_TWEETS: {
      return initialState
    }

    default: {
      return state
    }

  }

}
