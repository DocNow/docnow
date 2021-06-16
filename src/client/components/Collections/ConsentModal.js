import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import Checkbox from '@material-ui/core/Checkbox'

import {labels, labelNames, Label} from '../Label'
import style from './ConsentModal.css'

export default class ConsentModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      selectedLabels: new Set()
    }
  }

  render() {
    const modalStyle = {
      content: {
        padding: '0px',
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: '600px'
      }
    }
    const app = document.getElementById('App')
    return (
      <Modal isOpen={this.props.isOpen} style={modalStyle} appElement={app}>
        <div className={style.CloseModal}>
          <ion-icon name="close-circle" onClick={() => {this.props.close()}}></ion-icon>
        </div>
        <div className={style.Labels}>
          {labels.map(label => {
            const checked = this.state.selectedLabels.has(label)
            return (
              <div 
                key={`label-${label}`} 
                className={style.Label}
                onClick={() => this.toggleLabel(label)}>
                <Label name={label} />
                <br />
                <Checkbox color="primary" checked={checked} />
                {labelNames[label]}
              </div>
            )
          })}
        </div>
      </Modal>
    )
  }

  toggleLabel(label) {
    const searchId = this.props.searchId
    const selected = this.state.selectedLabels
    const tweetIds = this.props.selectedTweetIds
    if (selected.has(label)) {
      selected.delete(label)
      this.props.setConsentActions(searchId, tweetIds, label, true)
    } else {
      selected.add(label)
      this.props.setConsentActions(searchId, tweetIds, label)
    }
    this.setState({
      selectedLabels: new Set(selected)
    })
  }

}

ConsentModal.propTypes = {
  searchId: PropTypes.number,
  selectedTweetIds: PropTypes.array,
  isOpen: PropTypes.bool,
  close: PropTypes.func,
  setConsentActions: PropTypes.func,
}
