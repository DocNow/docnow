import React, { Component } from 'react'
import PropTypes from 'prop-types'

import card from '../Card.css'

import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import CardActions from '@material-ui/core/CardActions'
import IconButton from '@material-ui/core/IconButton'

export default class Video extends Component {
  showTweets() {
    this.props.getTweetsForVideo(this.props.searchId, this.props.url)
  }

  render() {
    return (
      <Card className={`${card.Card}`} style={{height: "365px"}}>
        <CardMedia>
          <video style={{width: '300px', height: '300px'}} controls src={this.props.url}/>
        </CardMedia>
        <CardActions>
          <IconButton aria-label="show tweets" onClick={() => {this.showTweets()}}>
            <ion-icon name="logo-twitter"></ion-icon>
          </IconButton>
          {this.props.count}
        </CardActions>
      </Card>
    )
  }
}

Video.propTypes = {
  url: PropTypes.string,
  count: PropTypes.number,
  searchId: PropTypes.string,
  getTweetsForVideo: PropTypes.func
}
