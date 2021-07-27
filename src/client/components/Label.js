import React from 'react'
import PropTypes from 'prop-types'

import style from './Label.css'

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

const labelStyles = {
  "sh-c-am": {backgroundColor: "pink", color: "white"},
  "sh-c-cg": {backgroundColor: "green", color: "white"},
  "sh-c-cm": {backgroundColor: "light-green", color: "black"},
  "sh-c-da": {backgroundColor: "purple", color: "white"},
  "sh-c-ea": {backgroundColor: "gray", color: "black"},
  "sh-c-rl": {backgroundColor: "orange", color: "white"},
  "sh-c-rm": {backgroundColor: "yellow", color: "black"},
  "sh-c-rn": {backgroundColor: "magenta", color: "white"}
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

const ImageLabel = props => {
  return (
    <img
      className={style.Label} 
      alt={labelNames[props.name]}
      title={labelDescriptions[props.name]}
      src={require(`../images/social-humans/${props.name}.jpg`)} />
  )
}

const ButtonLabel = props => {
  return (
    <a className={style.Label} href={`https://www.docnow.io/social-humans/${props.name}.html`}>
      <button
        style={labelStyles[props.name]}
        alt={labelNames[props.name]}
        title={labelDescriptions[props.name]}>
        {props.name}
      </button>
    </a>
  )
}

ImageLabel.propTypes = {
  name: PropTypes.string
}

ButtonLabel.propTypes = {
  name: PropTypes.string
}

export {
  ImageLabel,
  ButtonLabel,
  labels,
  labelNames
}