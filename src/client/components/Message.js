import React from 'react'
import PropTypes from 'prop-types'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import { Alert, AlertTitle } from '@material-ui/lab'

export default function Message({message, clearMessage}) {
  const open = message !== null

  // This is hard wired for errors at the moment. But it could also display 
  // informational messages by setting the Alert severity to other values.

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={open}
      onClose={clearMessage}
      ContentProps={{
        'aria-describedby': 'message-id',
      }}
      message={
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {message}
        </Alert>
      }
      variant="outlined"
      action={[
        <IconButton
          key="close"
          aria-label="close"
          color="inherit"
          onClick={clearMessage}
        >
          <CloseIcon />
        </IconButton>,
      ]}
    />
  )
}

Message.propTypes = {
  message: PropTypes.string,
  code: PropTypes.number,
  clearMessage: PropTypes.func
}