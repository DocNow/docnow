import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from '../styles/Hashtags.css'

import 'd3-transition'
import { max } from 'd3-array'
import { select } from 'd3-selection'
import { scaleLinear } from 'd3-scale'

export default class Hashtags extends Component {

  componentDidMount() {
    this.createBarChart()
  }

  componentDidUpdate() {
    this.createBarChart()
  }

  createBarChart() {
    const node = this.node

    const maxX = max(this.props.hashtags.map((ht) => {return ht.count}))
    const xScale = scaleLinear()
      .domain([0, maxX])
      .range([0, 300])

    const key = (d) => {
      return `hashtag-${d.hashtag}`
    }

    const bars = select(node)
      .selectAll('rect')
      .data(this.props.hashtags, key)

    bars
      .exit()
        .remove()

    bars
      .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', (d, i) => i * 25)
        .attr('width', (d) => {return xScale(d.count)})
        .attr('height', 20)
      .merge(bars)
        .transition()
        .duration(750)
        .attr('y', (d, i) => i * 25)
        .attr('width', d => {return xScale(d.count)})

  }

  render() {
    let loader = null
    if (this.props.hashtags.length === 0) {
      loader = 'Loading...'
    }

    return (
      <div className={styles.HashtagsCard}>
        {loader}
        <svg ref={node => this.node = node} height={800} />
      </div>
    )
  }
}

Hashtags.propTypes = {
  hashtags: PropTypes.array
}
