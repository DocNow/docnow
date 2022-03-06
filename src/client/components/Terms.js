import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'

import style from './Terms.css'

export default class Terms extends Component {

  constructor() {
    super()
    this.state = {
      edit: false
    }
  }

  render() {
    if (this.state.edit) {
      return (
        <div className={style.Terms}>
          <Button 
            variant="contained"
            color="primary"
            onClick={() => this.save()}>
            Save
          </Button>
          <p>Edit the Terms of Service using <a target="_new" href="https://www.markdownguide.org/cheat-sheet">Markdown</a>.</p>
          <textarea 
            onChange={e => this.update(e.target.value)}
            value={this.props.termsOfService} />
        </div>
      )
    } else {
      return (
        <div className={style.Terms}>
          { this.editButton() }
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {this.props.termsOfService}
          </ReactMarkdown>
          <hr />
          <p>
            I have read and acknowledge the&nbsp;
            <Link to="/terms/">Terms of Service</Link>&nbsp;
            <Checkbox 
              name="termsOfService"
              color="primary"
              onChange={e => {
                this.props.updateUserSettings('termsOfService', e.target.checked)
                this.props.saveUserSettings()
              }}
              checked={this.props.agreedTermsOfService || false} />
          </p>
        </div>
      )
    }
  }

  save() {
    this.props.saveTerms()
    this.setState({edit: false})
  }

  update(markdown) {
    this.props.updateTerms(markdown)
  }

  editButton() {
    if (this.props.isSuperUser) {
      return (
        <Button 
          variant="contained"
          color="default"
          onClick={() => this.setState({edit: true})}>
          Edit
        </Button>
      )
    } else {
      return ''
    }
  }

}

Terms.propTypes = {
  termsOfService: PropTypes.string,
  agreedTermsOfService: PropTypes.bool,
  isSuperUser: PropTypes.bool,
  updateTerms: PropTypes.func,
  saveTerms: PropTypes.func,
  updateUserSettings: PropTypes.func,
  saveUserSettings: PropTypes.func,
}
