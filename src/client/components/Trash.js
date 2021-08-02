import React from 'react'
import PropTypes from 'prop-types'
import style from './Trash.css'

import Modal from 'react-modal'
import CloseModal from './Insights/CloseModal'
import Button from '@material-ui/core/Button'

const modalStyle = {
  content: {
    padding: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: 300,
    height: 200,
  }
}

const Trash = ({id, title, deleteSearch}) => {

  const app = document.getElementById('App')
  const [open, setOpen] = React.useState(false)

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <span className={style.Trash} onClick={handleOpen}>
        <ion-icon title="Delete Search!" name="trash"></ion-icon>
      </span>
      <Modal
        appElement={app}
        style={modalStyle}
        className={style.Modal}
        isOpen={open}
        onClose={handleClose}
        centered
      >
        <CloseModal title="Delete Search" close={handleClose} style={{width: 300}} />
        <div className={style.DeleteSearch}>
          <p>
            Would you like to delete your search <span className={style.Title}>{title}</span> ? 
            Be careful, this cannot be undone!
          </p>
          <div className={style.DeleteButton}>
            <Button variant="contained" onClick={() => deleteSearch({id})}>
              Delete Search
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

Trash.propTypes = {
  id: PropTypes.number,
  title: PropTypes.string,
  deleteSearch: PropTypes.func
}

export default Trash
