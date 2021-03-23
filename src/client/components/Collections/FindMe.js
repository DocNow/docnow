import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'

import style from './FindMe.css'

export default class FindMe extends Component {
  constructor(props) {
    super(props)
    this.dest = this.props.dest ? this.props.dest : '/collections/'
  }

  render() {
    let button = (
      <a href={`/auth/twitter?dest=${this.dest}`}>
        <Button 
          title="See what collections you are in"
          variant="contained"
          color="primary">
            Find Me
        </Button>
      </a>
    )
    if (this.props.user && this.props.user.twitterScreenName) {
      button = (
        <Button title="Collections with your tweets will be highlighted in green" variant="contained" className={style.LoggedIn}>
          <ion-icon name="logo-twitter"></ion-icon> &nbsp; 
          @{this.props.user.twitterScreenName}
        </Button>
      )
    }
    return <div className={style.FindMe}>{button}</div>
  }

}

FindMe.propTypes = {
  user: PropTypes.object,
  dest: PropTypes.string
}