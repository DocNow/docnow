import React, { Component } from 'react'
import dn from '../images/dn.png'
import PropTypes from 'prop-types'

export default class LogoUpload extends Component {
  state = {
    imagePreviewUrl: this.props.logoUrl ? this.props.logoUrl : dn
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
      imagePreview = (<img width="100" height="100" src={imagePreviewUrl} />)
    } else {
      imagePreview = (<div className="previewText">Please select an Image for Preview</div>)
    }

    return (
      <div className="previewComponent">
          <input className="fileInput"
            type="file"
            onChange={(e)=>this.handleImageChange(e)} />
        <div className="imgPreview">
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
