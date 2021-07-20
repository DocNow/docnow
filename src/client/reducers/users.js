import { SET_USERS } from '../actions/users'
import { ACTIVATE_USER, DEACTIVATE_USER, ACTIVATE_ADMIN, 
         DEACTIVATE_ADMIN, UPDATE_QUOTA } from '../actions/user'

const initialState = []

export default function users(state = initialState, action) {
  switch (action.type) {

    case SET_USERS: {
      return action.users
    }

    case ACTIVATE_USER: {
      const newState = [...state]
      const user = newState.find(u => u.id == action.user.id)
      if (user) {
        user.active = true
      }
      return newState
    }

    case DEACTIVATE_USER: {
      const newState = [...state]
      const user = newState.find(u => u.id == action.user.id)
      if (user) {
        user.active = false
      }
      return newState
    }

    case ACTIVATE_ADMIN: {
      const newState = [...state]
      const user = newState.find(u => u.id == action.user.id)
      if (user) {
        user.isSuperUser = true
      }
      return newState
    }

    case DEACTIVATE_ADMIN: {
      const newState = [...state]
      const user = newState.find(u => u.id == action.user.id)
      if (user) {
        user.isSuperUser = false
      }
      return newState
    }

    case UPDATE_QUOTA: {
      const newState = [...state]
      const user = newState.find(u => u.id == action.user.id)
      if (user) {
        user.tweetQuota = action.quota
      }
      return newState
    }

    default: {
      return state
    }

  }
}
