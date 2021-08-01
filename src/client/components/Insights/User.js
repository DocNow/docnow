import React, { Component } from 'react'
import PropTypes from 'prop-types'

import card from '../Card.css'

import Avatar from '@material-ui/core/Avatar'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import CardActions from '@material-ui/core/CardActions'
import IconButton from '@material-ui/core/IconButton'

export default class User extends Component {
  showTweets() {
    this.props.getTweetsForUser(this.props.searchId, this.props.screenName)
  }

  render() {

    const monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];

    let loc = null
    let url = null
    if (this.props.location) {
      loc = (<Typography variant="body2" color="textSecondary" component="p">
        <a href={this.props.location}>{this.props.location}</a>
      </Typography>)
    }
    if (this.props.url) {
      url = (<Typography variant="body2" color="textSecondary" component="p">
        {this.props.url}
      </Typography>)
    }

    const date = new Date(this.props.created)

    return (
      <Card className={`${card.Card}`} style={{height: "365px"}}>
        <CardHeader
          avatar={
            <Avatar aria-label="recipe">
              <img src={this.props.avatarUrl}/>
            </Avatar>
          }
          title={this.props.name}
          subheader={<a href={`https://twitter.com/${this.props.screenName}`}>@{this.props.screenName}</a>}
        />
        <CardContent>
          <Typography variant="body1" component="p">
            {this.props.desc}
          </Typography>
          {loc} {url}
          <Typography variant="body2" color="textSecondary" component="p">
            Joined {monthNames[date.getMonth()]} {date.getFullYear()}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {this.props.friends} Following
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {this.props.followers} Followers
          </Typography>
        </CardContent>
        <CardActions>
          <IconButton aria-label="show tweets" onClick={() => {this.showTweets()}}>
            <ion-icon name="logo-twitter"></ion-icon>
          </IconButton>
        </CardActions>
      </Card>
    )
  }
}

User.propTypes = {
  name: PropTypes.string,
  screenName: PropTypes.string,
  avatarUrl: PropTypes.string,
  location: PropTypes.string,
  url: PropTypes.string,
  created: PropTypes.string,
  friends: PropTypes.number,
  followers: PropTypes.number,
  desc: PropTypes.string,
  count: PropTypes.number,
  searchId: PropTypes.number,
  getTweetsForUser: PropTypes.func
}
