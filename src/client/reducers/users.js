import { SET_USERS } from '../actions/users'

const initialState = []

export default function settings(state = initialState, action) {
  switch (action.type) {

    case SET_USERS: {
      return action.users
    }

    default: {
      return state
    }

  }
}
