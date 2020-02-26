import React, { Component } from 'react'
import PropTypes from 'prop-types'
import exploreStyles from './Explore.css'
import styles from './HashtagChart.css'
import animations from '../animations.css'

import 'd3-transition'
import { max } from 'd3-array'
import { select } from 'd3-selection'
import { scalePow } from 'd3-scale'

export default class Hashtags extends Component {

  componentDidMount() {
    this.createBarChart()
  }

  componentDidUpdate() {
    this.createBarChart()
  }

  createBarChart() {
    const node = this.node
    const that = this

    const maxX = max(this.props.hashtags.map((ht) => {return ht.count}))
    const xScale = scalePow()
      .exponent(0.5)
      .domain([0, maxX])
      .range([0, 275])

    const key = (d) => {
      return `hashtag-${d.hashtag}`
    }

    const g = select(node)
      .selectAll('g')
      .attr('class', styles.Bar)
      .data(this.props.hashtags, key)

    g.select('rect')
      .transition()
      .duration(2000)
      .attr('width', (d) => xScale(d.count))

    g.select('text')
      .transition()
      .duration(2000)
      .text((d) => {return d.count + ' #' + d.hashtag})

    g.exit()
      .remove()

    const gEnter = g.enter()
      .append('g')
      .attr('class', styles.Bar)
      .attr('transform', (d, i) => {
        return 'translate(0,' + (i * 25) + ')'
      })
      .on('click', (d) => {
        that.props.addSearchTerm({
          type: 'hashtag',
          value: '#' + d.hashtag
        })
      })

    gEnter.append('rect')
      .attr('dx', 0)
      .attr('dy', 0)
      .attr('width', (d) => {return xScale(d.count)})
      .attr('height', 20)

    gEnter.append('text')
      .text((d) => {return '#' + d.hashtag + ' (' + d.count + ')'})
      .attr('dx', 5)
      .attr('dy', 15)

    gEnter.merge(g)
      .transition()
      .duration(2000)
      .attr('transform', (d, i) => {
        return 'translate(0,' + (i * 25) + ')'
      })

  }

  render() {
    let loader = null
    if (this.props.hashtags.length === 0) {
      loader = (<span className={`${animations.Spin} ${exploreStyles.Loader}`}>
        <ion-icon name="logo-ionic"></ion-icon>
      </span>)
    }

    return (
      <div className={`${styles.HashtagsCard} ${exploreStyles.InnerCard}`}>
        {loader}
        <svg 
          className={styles.HashtagChart} 
          ref={node => {this.node = node}} />
      </div>
    )
  }
}

Hashtags.propTypes = {
  hashtags: PropTypes.array,
  addSearchTerm: PropTypes.func
}
