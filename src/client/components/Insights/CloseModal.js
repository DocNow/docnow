import React from 'react'
import PropTypes from 'prop-types'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

import style from './CloseModal.css'

const CloseModal = (props) => {
  const combinedStyle = {...style, ...props.style}
  return (
    <div style={combinedStyle} className={style.CloseModal}>
      <div className={combinedStyle.Title}>{props.title}</div>
      <IconButton
        key="close"
        aria-label="close"
        color="inherit"
        onClick={() => props.close()}>
        <CloseIcon />
      </IconButton>
    </div>
  )
}

CloseModal.propTypes = {
  close: PropTypes.func,
  style: PropTypes.object,
  title: PropTypes.string
}

export default CloseModal