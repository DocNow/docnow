import React, { Component } from 'react'
import PropTypes from 'prop-types'

import card from '../Card.css'

import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import CardActions from '@material-ui/core/CardActions'
import IconButton from '@material-ui/core/IconButton'

export default class Img extends Component {
  showTweets() {
    this.props.getTweetsByIds(this.props.searchId, this.props.tweets)
  }

  render() {
    return (
      <Card className={`${card.Card}`}>
        <CardMedia style={{paddingTop: '240px', position: 'relative'}} image={this.props.url}/>
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

Img.propTypes = {
  url: PropTypes.string,
  count: PropTypes.number,
  searchId: PropTypes.string,
  tweets: PropTypes.array,
  getTweetsByIds: PropTypes.func
}
