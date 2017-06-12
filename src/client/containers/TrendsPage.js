import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Trends from '../components/Trends'
import * as actions from '../actions/trends'

const mapStateToProps = (state) => {
  return {
    places: state.trends.places
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Trends)
