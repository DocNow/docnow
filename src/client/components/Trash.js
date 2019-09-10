import React from 'react'
import PropTypes from 'prop-types'
import style from './Trash.css'

const Trash = ({id, deleteSearch}) => {
  return (
    <span className={style.Trash} onClick={() => deleteSearch({id})}>
      <ion-icon title="Delete Search!" name="trash"></ion-icon>
    </span>
  )
}

Trash.propTypes = {
  id: PropTypes.string,
  deleteSearch: PropTypes.func
}

export default Trash
