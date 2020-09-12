import { SET_SYSTEM_STATS } from '../actions/stats'

const initialState = {
  tweetCount: 0,
  userCount: 0
}

export default function user(state = initialState, action) {
  switch (action.type) {

    case SET_SYSTEM_STATS: {
      return {
        ...state,
        ...action.stats
      }
    }

    default: {
      return state
    }

  }
}
