import { Component } from 'react'

export default class MediaQueryComponent extends Component {
  constructor(props) {
    super(props)
  }

  setMediaQuery(q, baseClass, mediaClass) {
    const widthChange = (mq) => {
      if (mq.matches) {
        this.setState((prevState) => {
          return Object.assign(prevState, {mediaStyle: `${baseClass} ${mediaClass}`})
        })
      } else {
        this.setState((prevState) => {
          return Object.assign(prevState, {mediaStyle: baseClass})
        })
      }
    }

    const mq = window.matchMedia(q)
    mq.addListener(widthChange)
    widthChange(mq)
  }

}
