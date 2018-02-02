import React, { Component } from 'react'
import def from '../images/mith.png'
import styles from './LogoUpload.css'
import PropTypes from 'prop-types'

export default class LogoUpload extends Component {
  state = {
    imagePreviewUrl: this.props.logoUrl ? this.props.logoUrl : def
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
    const {imagePreviewUrl} = this.state
    let imagePreview = null
    if (imagePreviewUrl) {
      imagePreview = (<img src={imagePreviewUrl} />)
    } else {
      imagePreview = (<span>Please select an Image for Preview</span>)
    }

    return (
      <div>
        <label>Your Logo:</label>
          <input
            type="file"
            onChange={(e)=>this.handleImageChange(e)} />
        <div className={styles.Preview}>
          {imagePreview}
        </div>
      </div>
    )
  }
}

LogoUpload.propTypes = {
  logoUrl: PropTypes.string,
  updateSettings: PropTypes.func
}
