export const GET_USER = 'GET_USER'
export const SET_USER = 'SET_USER'

export const setUser = (user) => {
  return {
    type: SET_USER,
    twitterUsername: user.username
  }
}

export const getUser = () => {
  return (dispatch) => {
    fetch('/api/v1/user', {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setUser(result.user))
      })
  }
}
