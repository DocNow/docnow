export const SET_WORLD = 'SET_WORLD'

export const setWorld = (world) => {
  return {
    type: SET_WORLD,
    world
  }
}

export const getWorld = () => {
  return (dispatch) => {
    fetch('/api/v1/world', {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setWorld(result))
      })
  }
}
