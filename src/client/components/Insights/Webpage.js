import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LazyLoad from 'react-lazy-load'
import Wayback from './Wayback'

import style from './Webpage.css'
import cb from './Checkbox.css'
import card from '../Card.css'
import doc from '../../images/doc.png'

import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import CardActions from '@material-ui/core/CardActions'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'

export default class Webpage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selected: this.props.selected
    }
  }

  showTweets() {
    this.props.getTweetsForUrl(this.props.searchId, this.props.url)
  }

  toggleSelect() {
    return this.state.selected ? this.deselect() : this.select()
  }

  select() {
    this.setState({selected: true})
    this.props.selectWebpage(this.props.searchId, this.props.url)
  }

  deselect() {
    this.setState({selected: false})
    this.props.deselectWebpage(this.props.searchId, this.props.url)
  }

  archive() {
    this.props.archive(this.props.url)
  }

  render() {
    let website = new URL(this.props.url).host
    website = website.replace(/^www\./, '')

    const img = this.props.image || doc

    return (
      <Card className={`${card.Card} ${card.Scroll} ${style.Webpage}`}>
        <CardMedia style={{paddingTop: '160px', position: 'relative'}} image={img}>
          <Checkbox
            className={cb.Checkbox}
            checked={this.state.selected}
            onChange={() => this.toggleSelect()}
            inputProps={{
              'aria-label': 'primary checkbox',
            }}
          />
        </CardMedia>
        <CardContent style={{overflowY: 'scroll', height: '190px'}}>
          <Typography variant="h2" component="h2">
            <a href={this.props.url}>{this.props.title}</a>
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {this.props.description}
          </Typography>
        </CardContent>
        <CardActions>
          <IconButton aria-label="show tweets" onClick={() => {this.showTweets()}}>
            <ion-icon name="logo-twitter"></ion-icon>
          </IconButton>
          {this.props.count}
          <Button size="small" color="primary" href={this.props.url} target="_new"
            className={style.UrlButton}>
            {website}
          </Button>
          <LazyLoad offsetVertical={800}>
            <Wayback
              url={this.props.url}
              archive={this.props.archive}
              checkArchive={this.props.checkArchive}
              saveArchive={this.props.saveArchive}/>
          </LazyLoad>
        </CardActions>
      </Card>
    )
  }
}

Webpage.propTypes = {
  url: PropTypes.string,
  title: PropTypes.string,
  image: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.array,
  count: PropTypes.number,
  selected: PropTypes.bool,
  deselected: PropTypes.bool,
  searchId: PropTypes.string,
  archive: PropTypes.object,
  getTweetsForUrl: PropTypes.func,
  selectWebpage: PropTypes.func,
  deselectWebpage: PropTypes.func,
  checkArchive: PropTypes.func,
  saveArchive: PropTypes.func,
}
