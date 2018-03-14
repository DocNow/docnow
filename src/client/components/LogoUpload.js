import React, { Component } from 'react'
import defaultLogo from '../images/mith.png'
import styles from './LogoUpload.css'
import PropTypes from 'prop-types'

export default class LogoUpload extends Component {
  state = {
    imagePreviewUrl: this.props.logoUrl ? this.props.logoUrl : defaultLogo
  }

  handleImageChange(e) {
    e.preventDefault()

    const reader = new FileReader()
    const file = e.target.files[0]

    reader.onloadend = () => {
      this.setState({
        imagePreviewUrl: reader.result
      })
      this.props.updateSettings(
        {target: {
          name: 'logoFile',
          value: file
        }
        })
      this.props.updateSettings(
        {target: {
          name: 'logoUrl',
          value: '/userData/images/logo.png'
        }
        })
    }

    reader.readAsDataURL(file)
  }

  render() {
    return (
      <p className={styles.LogoUpload}>
        <img src={this.state.imagePreviewUrl} />
        <br />
        <input
          type="file"
          onChange={(e)=>this.handleImageChange(e)} />
      </p>
    )
  }
}

LogoUpload.propTypes = {
  logoUrl: PropTypes.string,
  updateSettings: PropTypes.func
}
