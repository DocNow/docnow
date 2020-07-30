import React from 'react'
import PropTypes from 'prop-types'
import style from './Trash.css'

import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import Button from '@material-ui/core/Button'

const Trash = ({id, deleteSearch}) => {

  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <span className={style.Trash} onClick={handleOpen}>
        <ion-icon title="Delete Search!" name="trash"></ion-icon>
      </span>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={style.Modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
      <Fade in={open}>
        <div className={style.Paper}>
          <h2 id="transition-modal-title">Delete Search?</h2>
          <p id="transition-modal-description">This action cannot be undone.</p>
          <Button variant="contained" onClick={() => deleteSearch({id})}>
            Delete Search
          </Button>
        </div>
      </Fade>
    </Modal>
  </>
  )
}

Trash.propTypes = {
  id: PropTypes.string,
  deleteSearch: PropTypes.func
}

export default Trash
