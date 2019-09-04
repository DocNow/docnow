export const SET_USERS = 'SET_USERS'

export const setUsers = (users) => {
  return {
    type: SET_USERS,
    users
  }
}

export const getUsers = () => {
  return (dispatch) => {
    fetch('/api/v1/users', {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setUsers(result))
      })
  }
}

// perhaps this belongs in actions/user.js but it is only
// used by an admin to update another user

export const updateUser = (user) => {
  return (dispatch) => {
    const opts = {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(user),
      credentials: 'same-origin'
    }
    fetch(`/api/v1/user/${user.id}`, opts)
      .then(() => {
        dispatch(getUsers())
      })
  }
}