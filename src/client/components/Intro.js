import React from 'react'
import PropTypes from 'prop-types'
import style from './Intro.css'

const Intro = (props) => (
  <div className={style.Intro}>
    <p>
      {props.children}
    </p>
  </div>
)

Intro.propTypes = {
  children: PropTypes.node.isRequired
}

export default Intro

