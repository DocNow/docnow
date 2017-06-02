import React from 'react'
// import PropTypes from 'prop-types'
// import { push } from 'react-router-redux'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Trends from '../components/Trends'

const TrendsPage = () => (
  <div>
    <Trends />
  </div>
)

/*
TrendsPage.propTypes = {
  changePage: PropTypes.function
}
*/

const mapDispatchToProps = dispatch => bindActionCreators({
//  changePage: () => push('/about')
}, dispatch)

export default connect(null, mapDispatchToProps)(TrendsPage)
