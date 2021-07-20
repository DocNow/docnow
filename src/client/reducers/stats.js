import { SET_SYSTEM_STATS } from '../actions/stats'

const initialState = {
  tweetCount: 0,
  userCount: 0
}

export default function stats(state = initialState, action) {
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
