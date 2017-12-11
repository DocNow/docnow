import React, { Component } from 'react'
// import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import style from '../../styles/SavedSearchInfo.css'
import card from '../../styles/Card.css'
import download from '../../styles/DownloadOptions.css'
import ttb from '../../styles/TweetTabBar.css'
import sl from '../../styles/SearchList.css'

export default class Insights extends Component {
  render() {
    return (
      <div>
        <div className={style.SavedSearchInfo}>
          <div className={style.SavedSearchText}>
            <h2>Title of Saved Search <i className="fa fa-edit" aria-hidden="true" /></h2>
            <p>Here is the description of the collection. This will be pretty short most likely and can be edited in situ. <i className="fa fa-edit" aria-hidden="true" /><br />
              Search started on XX/XX/XX, last updated on XX/XX/XX at XX:XX:XX</p>
          </div>

          <div className={style.SavedSearchButtons}>
            <div className={sl.GridActionsInner}>
              <label className={sl.Switch}>
                <input type="checkbox" />
                <span className={sl.Slider + ' ' + sl.Round} />
              </label>
              <div className={sl.GridActionsInner} title="delete">
                <a href="">
                  <i className="fa fa-trash" className={sl.Trash + ' fa fa-trash'} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

        </div>
        <div className={ttb.TweetTabBar}>
          <ul>
            <li><a className={ttb.TweetTab + ' ' + ttb.TweetTabActive} href="/"><i className="fa fa-archive" aria-hidden="true" /> All</a></li>
            <li><a className={ttb.TweetTab} href="exampleselected.html"><i className="fa fa-check-square-o" aria-hidden="true" /> Selected</a></li>
            <li><a  className={ttb.TweetTab} href="exampleannotated.html"><i className="fa fa-comment" aria-hidden="true" /> Annotated</a></li>
          </ul>
        </div>
          <div className={card.CardHolder}>
            <div className={card.SavedShortCard}>
              <h1><a href="/">24,861<br />tweets</a></h1>
           </div>
           <div className={card.SavedLongCard}>
             <img src="images/exampletimeline.png" style={{height: '280px'}} />
           </div>
         </div>
         <div className={card.CardHolder}>
           <div className={card.SavedShortCard}>
             <h1><a href="/">542<br />users</a></h1>
           </div>
           <div className={card.SavedShortGraphCard}>
              <img src="images/exampleuserchart.png" style={{height: '280px'}} />
           </div>
           <div className={card.SavedShortGraphCard}>
             <img src="images/examplenetwork.png" style={{height: '280px'}} />
           </div>
         </div>
         <div className={card.CardHolder}>
           <div className={card.SavedImageCard}>
             <img src="images/examplewebsite.png" />
             <h1><a href="/">42<br />URLs</a></h1>
           </div>
           <div className={card.SavedImageCard}>
             <img src="images/image.png" />
             <h1><a href="/">98<br />images</a></h1>
           </div>
           <div className={card.SavedImageCard}>
             <img src="images/image.png" />
             <h1><a href="/">17<br />videos</a></h1>
           </div>
         </div>
         <div className={download.DownloadOptions}j>
           <button type="button">Download Full Data</button>
           <button type="button">Download Selected</button>
        </div>
      </div>
    )
  }
}

Insights.propTypes = {
  searchId: PropTypes.string,
}
