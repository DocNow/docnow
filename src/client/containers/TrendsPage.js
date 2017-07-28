import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Trends from '../components/Trends'
import { getTrends, updateNewTrend, saveTrends, deleteTrend } from '../actions/trends'

const mapStateToProps = (state) => {

  const placeLabelToId = label => {
    if (state.trends.placesByName[label]) {
      return state.trends.placesByName[label][0].id
    }
    return undefined
  }

  const placeIdToLabel = id => {
    for (const place of Object.values(state.trends.placesByName)) {
      if (place[0].id === id) {
        return place[0].name
      }
    }
  }

  return {
    username: state.user.twitterScreenName,
    trends: state.trends.places,
    placesByName: state.trends.placesByName,
    newPlace: state.trends.newPlace,
    placeIdToLabel,
    placeLabelToId
  }
}

const actions = {
  getTrends,
  updateNewTrend,
  saveTrends,
  deleteTrend
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Trends)
