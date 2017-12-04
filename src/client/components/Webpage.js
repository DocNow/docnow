import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LazyLoad from 'react-lazy-load'
import Wayback from './Wayback'
import style from '../styles/Webpage.css'
import card from '../styles/Card.css'
import doc from '../images/doc.png'

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
            <i onClick={() => {this.select()}} className={style.Add + ' fa fa-thumbs-up'} />
            &nbsp;
            <i onClick={() => {this.deselect()}} className={style.Remove + ' fa fa-thumbs-down'}/>
          </div>
          <a href={this.props.url} target="_new">
            <img src={img} />
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
            <i className="fa fa-twitter" />
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
              checkArchive={this.props.checkArchive}/>
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
}
