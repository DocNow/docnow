export const SET_QUEUE_STATS = 'SET_QUEUE'

export const setQueueStats = (queue) => {
  return {
    type: SET_QUEUE_STATS,
    queue
  }
}

export const getQueueStats = (searchId) => {
  return (dispatch) => {
    fetch(`/api/v1/search/${searchId}/queue`, {credentials: 'same-origin'})
      .then((resp) => resp.json())
      .then((result) => {
        dispatch(setQueueStats(result))
      })
  }
}
