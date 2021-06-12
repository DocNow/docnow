import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'

import style from './ConsentModal.css'

export default class ConsentModal extends Component {

  render() {
    const modalStyle = {
      content: {
        padding: '0px',
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: '400px'
      }
    }
    const app = document.getElementById('App')
    return (
      <Modal isOpen={this.props.isOpen} style={modalStyle} appElement={app}>
        <div className={style.CloseModal}>
          <ion-icon name="close-circle" onClick={() => {this.props.close()}}></ion-icon>
        </div>
        <div>
          {this.props.tweets.map((t, i) => (
            <p key={`t${i}`}>{i} {t}</p>
          ))}
        </div>
      </Modal>
    )
  }
}

ConsentModal.propTypes = {
  tweets: PropTypes.array,
  isOpen: PropTypes.bool,
  close: PropTypes.func,
}
