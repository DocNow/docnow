import { SET_WORLD, SET_TRENDS, NEW_TREND, REMOVE_TREND } from '../actions/trends'

const initialState = {
  places: [],
  newPlace: '',
  world: {}
}

export default function trends(state = initialState, action) {
  switch (action.type) {

    case SET_TRENDS:
      return {
        ...state,
        places: action.trends
      }

    case NEW_TREND: {
      return {
        ...state,
        newPlace: action.id
      }
    }

    case REMOVE_TREND: {
      const places = state.places.filter((place)=>{
        return place !== action.id
      })
      return {
        ...state,
        places
      }
    }

    case SET_WORLD: {
      return {
        ...state,
        world: action.world,
      }
    }

    default: {
      return state
    }
  }
}
