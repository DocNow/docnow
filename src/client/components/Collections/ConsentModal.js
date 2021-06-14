import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import Checkbox from '@material-ui/core/Checkbox'

import style from './ConsentModal.css'

const labels = [
  "sh-c-cg",
  "sh-c-da",
  "sh-c-ea",
  "sh-c-rl",
  "sh-c-rn",
  "sh-c-rm",
  "sh-c-am",
  "sh-c-cm",
]

const labelNames = {
  "sh-c-am": "Anonymize Me",
  "sh-c-cg": "Consent Granted",
  "sh-c-cm": "Credit Me",
  "sh-c-da": "Delay Access",
  "sh-c-ea": "Expire Access",
  "sh-c-rl": "Remove Location",
  "sh-c-rm": "Remove Media",
  "sh-c-rn": "Remove Network"
}

const labelDescriptions = {
  "sh-c-am": "I would like to be anonymized in the archive.",
  "sh-c-cg": "I consent to having my content archived",
  "sh-c-cm": "I would like to be credited in all presentations of the archive",
  "sh-c-da": "I would like access to my content to be delayed",
  "sh-c-ea": "I would like access to my contnent to expire",
  "sh-c-rl": "I would like my location to be removed from content",
  "sh-c-rm": "I would like all media to be removed from my content",
  "sh-c-rn": "I would like my social media network connectsion to be removed"
}

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
                <img 
                  alt={labelNames[label]}
                  title={labelDescriptions[label]}
                  src={`/userData/images/social-humans/${label}.jpg`} />
                  <br />
                  <Checkbox 
                    color="primary" 
                    checked={checked} 
                    onChange={() => this.toggleLabel(label)} />
                  {labelNames[label]}
              </div>
            )
          })}
        </div>
      </Modal>
    )
  }

  toggleLabel(label) {
    const selected = this.state.selectedLabels
    if (selected.has(label)) {
      selected.delete(label)
    } else {
      selected.add(label)
    }
    this.setState({
      selectedLabels: selected
    })
  }

}

ConsentModal.propTypes = {
  tweets: PropTypes.array,
  isOpen: PropTypes.bool,
  close: PropTypes.func,
}
