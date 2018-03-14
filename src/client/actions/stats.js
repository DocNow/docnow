export const SET_SYSTEM_STATS = 'SET_SYSTEM_STATS'

export const setSystemStats = (stats) => {
  return {
    type: SET_SYSTEM_STATS,
    stats
  }
}

export const getSystemStats = () => {
  return async (dispatch) => {
    const stats = await fetch('/api/v1/stats', {credentials: 'same-origin'})
      .then((resp) => {return resp.json()})
    console.log(stats)
    dispatch(setSystemStats(stats))
  }
}
