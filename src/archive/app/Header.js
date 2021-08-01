import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Redirect } from 'react-router-dom'
import Button from '@material-ui/core/Button'

import style from './Header.css'
import dn from '../../client/images/dn.png'

export default class Header extends Component {
  constructor(props) {
    super(props)
    this.state = { goingHome: false }
  }

  get startDate() {
    return new Date(this.props.startDate)
  }

  get endDate() {
    return new Date(this.props.endDate)
  }

  render() {
    if (this.state.goingHome) {
      return <Redirect to="/" />
    }
    let backButton = null
    if (!this.props.isHome) {
      backButton = <Button variant="contained" color="primary"
        onClick={() => {this.setState({goingHome: true})}}>Back</Button>
    }    
    return (
      <div className={style.Header}>
        <div className={style.Logo}>
          <img src={dn} /> Archived DocNow Collection
        </div>
        <div className={style.Metadata}>
          <div>
            <span className={style.Label}>Title:</span>
            {this.props.title}
          </div>
          <div>
            <span className={style.Label}>Description:</span>
            {this.props.desc}
          </div>
          <div><span className={style.Label}>
            Creator:</span> {this.props.creator}
          </div>
          <div>
            <span className={style.Label}>Query:</span>
            <span className={style.Query}>{this.props.searchQuery}</span>
          </div>
          <div>
            <span className={style.Label}>Dates:</span> 
            {this.startDate.toLocaleDateString()} - {this.endDate.toLocaleDateString()}
          </div>
        </div>
        {backButton}
      </div>
    )
  }
}

Header.propTypes = {
  title: PropTypes.string,
  desc: PropTypes.string,
  creator: PropTypes.string,
  searchQuery: PropTypes.string,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  isHome: PropTypes.bool
}