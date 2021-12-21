export const SET_MESSAGE = 'SET_MESSAGE'
export const CLEAR_MESSAGE = 'CLEAR_MESSAGE'

export const setMessage = ({message, code}) => ({
  type: SET_MESSAGE,
  message: message,
  code: code
}) 

export const clearMessage = () => ({
  type: CLEAR_MESSAGE
})