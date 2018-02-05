import { SET_SEARCHES } from '../actions/searches'
import { SET_TWITTER_SEARCH } from '../actions/search'

const initialState = []

export default function settings(state = initialState, action) {
  switch (action.type) {

    case SET_SEARCHES: {
      return action.searches
    }

    case SET_TWITTER_SEARCH: {
      const pos = state.findIndex((s) => {
        return s.id === action.search.id
      })
      const search = {...state[pos], ...action.search}
      console.log(search)
      return [
        ...state.slice(0, pos),
        search,
        ...state.slice(pos + 1)
      ]
    }

    default: {
      return state
    }

  }
}
