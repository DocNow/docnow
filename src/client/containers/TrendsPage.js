// import React from 'react'
// import { push } from 'react-router-redux'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Trends from '../components/Trends'
import * as actions from '../actions/trends'

const mapStateToProps = (state) => {
  return {
    count: state.trends.count
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Trends)
