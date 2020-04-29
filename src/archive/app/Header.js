import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Redirect } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import style from './Header.css'
import iStyle from '../../client/components/Insights/Insights.css'
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
    return (<div className={iStyle.InsightsCard}>
      <Typography variant="h1" component="h2">
        <img src={dn} style={{verticalAlign: 'middle'}}/> Archived DocNow Collection
      </Typography>
      <Typography variant="h1" component="h2">
        {this.props.title}
      </Typography>
      <div className={style.Description}>{this.props.desc}</div>
      <div className={style.Metadata}>
        <div><span className={style.Label}>
          Created by:</span> {this.props.creator}
        </div>
        <div>
          <span className={style.Label}>Twitter search query:</span>
          <span className={style.Query}>{this.props.searchQuery}</span>
        </div>
        <div>
          <span className={style.Label}>Tweets archived between:</span> 
          {this.startDate.toLocaleDateString()} - {this.endDate.toLocaleDateString()}
        </div>
      </div>
      {backButton}
    </div>)
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