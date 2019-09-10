import { SET_USERS } from '../actions/users'
import { ACTIVATE_USER, DEACTIVATE_USER } from '../actions/user'

const initialState = []

export default function settings(state = initialState, action) {
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

    default: {
      return state
    }

  }
}
