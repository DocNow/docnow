import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LazyLoad from 'react-lazy-load'
import Wayback from './Wayback'

import style from './Webpage.css'
import card from '../Card.css'
import doc from '../../images/doc.png'

export default class Webpage extends Component {

  showTweets() {
    this.props.getTweetsForUrl(this.props.searchId, this.props.url)
  }

  select() {
    this.props.selectWebpage(this.props.searchId, this.props.url)
  }

  deselect() {
    this.props.deselectWebpage(this.props.searchId, this.props.url)
  }

  archive() {
    this.props.archive(this.props.url)
  }

  render() {
    let website = new URL(this.props.url).host
    website = website.replace(/^www\./, '')

    const img = this.props.image || doc

    let selectedStyle = style.Unselected
    if (this.props.selected === true) {
      selectedStyle = style.Selected
    } else if (this.props.deselected === true) {
      selectedStyle = style.Deselected
    }

    return (
      <div className={card.Card + ' ' +  selectedStyle}>
        <div className={style.Image}>
          <div className={style.Controls}>
            <span className={style.Add}>
              <ion-icon name="thumbs-up" onClick={() => {this.select()}}></ion-icon>
              </span>
            &nbsp;
            <span className={style.Remove}>
              <ion-icon name="thumbs-down" onClick={() => {this.deselect()}} className={style.Remove}></ion-icon>
            </span>
          </div>
          <a href={this.props.url} target="_new">
            <img rel="noreferrer" src={img} />
          </a>
        </div>
        <div className={style.Title}>
          <a href={this.props.url} target="_new">
            {this.props.title}
          </a>
        </div>
        <div className={style.Description}>
          {this.props.description}
        </div>
        <div className={style.Stats}>
          <div
            className={style.Count}
            onClick={() => {this.showTweets()}}>
            <ion-icon name="logo-twitter"></ion-icon>
            &nbsp;
            {this.props.count}
          </div>
          <div className={style.WebsiteName}>
            <a href={this.props.url} target="_new">{website}</a>
          </div>
          <LazyLoad offsetVertical={800}>
            <Wayback
              url={this.props.url}
              archive={this.props.archive}
              checkArchive={this.props.checkArchive}
              saveArchive={this.props.saveArchive}/>
          </LazyLoad>
        </div>
      </div>
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
