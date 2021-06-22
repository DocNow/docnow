import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'

import {labels, labelNames, Label} from '../Label'
import style from './ConsentModal.css'

export default class ConsentModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      selectedLabels: new Set(),
      hasModified: false,
      currentTab: 0
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

    const selected = this.state.hasModified 
      ? this.state.selectedLabels 
      : this.getSharedLabels()

    const app = document.getElementById('App')

    return (
      <Modal isOpen={this.props.isOpen} style={modalStyle} appElement={app}>

          <h1>{this.state.selectedTab}</h1>

          <div className={style.ConsentModal}>

            <div className={style.CloseModal}>
              <ion-icon name="close-circle" onClick={() => {this.props.close()}}></ion-icon>
            </div>

            <Tabs
              textColor="primary"
              value={this.state.currentTab}
              onChange={() => this.switchTab()}
              centered>
              <Tab label="Specify Consent" />
              <Tab label="Revoke Consent" />
            </Tabs>

            <div hidden={this.state.currentTab != 0}>
              <p>
                Twitter&lsquo;s Terms of Service allow for third party reuse of
                tweets. However the DocNow application goes further to enact 
                archival ethics by seeking your specified consent beyond
                what Twitter&lsquo;s terms specify. In order to recognize that consent 
                is an ongoing and complex practice you may specify your conditions 
                of consent using <a href="https://www.docnow.io/social-humans/">Social Humans</a> labels.
              </p>
              <div className={style.Labels}>
                {labels.map(label => {
                  const checked = selected.has(label)
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
            </div>

            <div hidden={this.state.currentTab != 1}>
              <p>
                Twitter&lsquo;s Terms of Service allow for third party reuse of
                tweets. However the DocNow application goes further to enact 
                archival ethics by seeking your specified consent beyond
                what Twitter&lsquo;s terms specify.
              </p>

              <p>
                If you would like your tweets to be completely removed from this 
                collection please use the Delete button below. Note, this will
                not delete your tweets from Twitter but only from this DocNow instance. 
                It cannot be undone.
              </p>
              <p className={style.Revoke}>
                <Button
                  onClick={() => this.revoke()} 
                  size="large"
                  variant="contained"
                  color="secondary">Revoke Consent</Button>
              </p>
            </div>

          </div>

      </Modal>
    )
  }

  toggleLabel(label) {
    const searchId = this.props.searchId
    const tweetIds = this.props.selectedTweets.map(t => t.id)

    const selected = this.state.hasModified
      ? this.state.selectedLabels
      : this.getSharedLabels()
      
    if (selected.has(label)) {
      selected.delete(label)
      this.props.setConsentActions(searchId, tweetIds, label, true)
    } else {
      selected.add(label)
      this.props.setConsentActions(searchId, tweetIds, label)
    }
    this.setState({
      selectedLabels: new Set(selected),
      hasModified: true
    })
  }

  getSharedLabels() {
    let shared = null
    if (this.props.selectedTweets.length > 0) {
      this.props.selectedTweets.forEach(tweet => {
        const tweetLabels = tweet.consentActions.map(a => a.name)
        if (shared === null) {
          shared = new Set(tweetLabels)
        } else {
          shared = new Set(tweetLabels.filter(l => shared.has(l)))
        }
      })
    } else {
      shared = new Set()
    }
    return shared
  }

  switchTab() {
    if (this.state.currentTab == 0) {
      this.setState({currentTab: 1})
    } else {
      this.setState({currentTab: 0})
    }
  }

  revoke() {
    const tweetIds = this.props.selectedTweets.map(t => t.id)
    this.props.revokeConsent(this.props.searchId, tweetIds)
  }

}

ConsentModal.propTypes = {
  searchId: PropTypes.string,
  selectedTweets: PropTypes.array,
  isOpen: PropTypes.bool,
  close: PropTypes.func,
  setConsentActions: PropTypes.func,
  revokeConsent: PropTypes.func
}
