import React from 'react'
import PropTypes from 'prop-types'
import '@material/react-tab-bar/index.scss'
import '@material/react-tab-scroller/index.scss'
import '@material/react-tab/index.scss'
import '@material/react-tab-indicator/index.scss'
import Tab from '@material/react-tab'
import TabBar from '@material/react-tab-bar'
import MaterialIcon from '@material/react-material-icon'
import MediaQueryComponent from './MediaQueryComponent'

import styles from './TabBar.css'

export default class TabBarComponent extends MediaQueryComponent {
  constructor(props) {
    super(props)
    this.links = [
      {dest: '/', label: 'Trending', icon: 'timeline'},
      {dest: '/explore/', label: 'Explore', icon: 'search'}, 
      {dest: '/searches/', label: 'Saved Seaches', icon: 'archive'}
    ]
    this.handleActiveIndexUpdate = this.handleActiveIndexUpdate.bind(this)
  }

  componentDidMount() {
    this.setMediaQuery('(max-width: 480px)', '', styles.NoLabel)
  }

  handleActiveIndexUpdate(activeIndex) {
    this.props.navigateTo(this.links[activeIndex].dest)
  }

  render() {
    let activeIndex = 0
    switch (this.props.location) {
      case '/':
        activeIndex = 0
        break
      case '/explore/':
        activeIndex = 1
        break
      case '/searches/':
        activeIndex = 2
        break
      default:
        break
    }

    return (
      <TabBar
        activeIndex={activeIndex}
        handleActiveIndexUpdate={this.handleActiveIndexUpdate}
      >{
        this.links.map((link, i) => {
          return (<Tab key={`l-${i}`}>
            <MaterialIcon className="mdc-tab__icon" icon={link.icon} />
            <span className={`mdc-tab__text-label ${this.state.mediaStyle}`}>{link.label}</span>
          </Tab>)
        })
      }
      </TabBar>
    )

    // return (
    //   <div className={styles.TabBar}>
    //     <ul>
    //       <li>
    //         <Link className={`${styles.Tab} ${trendsActive}`} to="/">
    //           <i className="fa fa-area-chart" aria-hidden="true"/>
    //           &nbsp;
    //           Trending
    //         </Link>
    //       </li>
    //       <li>
    //         <Link className={`${styles.Tab} ${searchActive}`} to="/explore/">
    //           <i className="fa fa-search" aria-hidden="true"/>
    //           &nbsp;
    //           Explore
    //         </Link>
    //       </li>
    //       <li>
    //         <Link className={`${styles.Tab} ${searchlistActive}`} to="/searches/">
    //           <i className="fa fa-archive" aria-hidden="true"/>
    //           &nbsp;
    //           Saved Searches
    //         </Link>
    //       </li>
    //     </ul>
    //   </div>
    // )
  }

}

TabBarComponent.propTypes = {
  location: PropTypes.string,
  isSuperUser: PropTypes.bool,
  navigateTo: PropTypes.func
}
