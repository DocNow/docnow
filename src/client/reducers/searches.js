import { SET_SEARCHES } from '../actions/searches'
import { SET_TWITTER_SEARCH, DELETE_SEARCH, ADD_SEARCH } from '../actions/search'

const initialState = []

export default function settings(state = initialState, action) {
  switch (action.type) {

    case SET_SEARCHES: {

      /*
       * Since the state of a search can be manipulated in the UI while an
       * AJAX call to update the searches is going on we need to be careful
       * not to update the searches with information that is stale.
       *
       * To do this we compare the updated times of the searches we've been
       * given with the updated times of the searches we currently have.
       * If any of the searches we have are newer than the searches we've
       * been given then we declare the information stale and return
       * the current state.
       */

      const updateTimes = new Map()
      state.map(s => updateTimes.set(s.id, s.updated))

      let stale = false
      for (const s of action.searches) {
        if (s.updated < updateTimes.get(s.id)) {
          stale = true
        }
      }

      if (stale) {
        return state
      } else {
        return action.searches
      }
    }

    case SET_TWITTER_SEARCH: {
      if (action.search.active === false) {
        return state
      }

      const pos = state.findIndex((s) => {
        return s.id === action.search.id
      })
      if (pos === -1) {
        return state
      }

      const search = {...state[pos], ...action.search}
      return [
        ...state.slice(0, pos),
        search,
        ...state.slice(pos + 1)
      ]
    }

    case DELETE_SEARCH: {
      const pos = state.findIndex((s) => {
        return s.id === action.search.id
      })
      return [
        ...state.slice(0, pos),
        ...state.slice(pos + 1)
      ]
    }

    case ADD_SEARCH: {
      return [
        action.search,
        ...state
      ]
    }

    default: {
      return state
    }

  }
}
