import { SET_QUEUE_STATS } from '../actions/queue'

const initialState = {
  remaining: 0,
  total: 0
}

export default function queue(state = initialState, action) {

  switch (action.type) {

    case SET_QUEUE_STATS: {
      return {
        ...state,
        remaining: action.queue.remaining,
        total: action.queue.total
      }
    }

    default: {
      return state
    }

  }

}
