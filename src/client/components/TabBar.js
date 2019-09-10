import React from 'react'
import PropTypes from 'prop-types'
import '@material/react-tab-bar/index.scss'
import '@material/react-tab-scroller/index.scss'
import '@material/react-tab/index.scss'
import '@material/react-tab-indicator/index.scss'
import Tab from '@material/react-tab'
import TabBar from '@material/react-tab-bar'
import MediaQueryComponent from './MediaQueryComponent'

import styles from './TabBar.css'

export default class TabBarComponent extends MediaQueryComponent {
  constructor(props) {
    super(props)
    this.links = [
      {dest: '/', label: 'Trending', icon: 'analytics'},
      {dest: '/explore/', label: 'Explore', icon: 'search'}, 
      {dest: '/searches/', label: 'Saved Searches', icon: 'filing'},
    ]
    if (props.isSuperUser) {
      this.links.push({dest: '/users/', label: 'Users', icon: 'person'})
    }
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
      case '/users/':
        activeIndex = 3
        break
      default:
        if (this.props.location.match('/search/')) {
          activeIndex = 2
        }
    }

    return (
      <TabBar
        className={styles.TabBar}
        activeIndex={activeIndex}
        handleActiveIndexUpdate={this.handleActiveIndexUpdate}
      >{
        this.links.map((link, i) => {
          return (<Tab key={`l-${i}`}>
            <ion-icon name={link.icon} style={{fontSize: '180%'}}></ion-icon>
            &nbsp;
            <span className={`mdc-tab__text-label ${this.state.mediaStyle}`}>{link.label}</span>
          </Tab>)
        })
      }
      </TabBar>
    )
  }

}

TabBarComponent.propTypes = {
  location: PropTypes.string,
  isSuperUser: PropTypes.bool,
  navigateTo: PropTypes.func
}
