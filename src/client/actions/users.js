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