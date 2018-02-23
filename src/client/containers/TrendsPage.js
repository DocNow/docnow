import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Trends from '../components/Trends/Trends'
import { createSearch } from '../actions/search'
import { getTrends, updateNewTrend, saveTrends, deleteTrend } from '../actions/trends'

const mapStateToProps = (state) => {

  const placeLabelToId = label => {
    if (state.trends.world[label]) {
      return state.trends.world[label][0].id
    }
    return undefined
  }

  const placeIdToLabel = id => {
    for (const place of Object.values(state.trends.world)) {
      if (place[0].id === id) {
        return place[0].name
      }
    }
  }

  return {
    username: state.user.twitterScreenName,
    trends: state.trends.places,
    world: state.trends.world,
    newPlace: state.trends.newPlace,
    placeIdToLabel,
    placeLabelToId
  }
}

const actions = {
  getTrends,
  updateNewTrend,
  saveTrends,
  deleteTrend,
  createSearch
}

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Trends)
