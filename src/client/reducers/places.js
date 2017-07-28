import { SET_WORLD } from '../actions/places'

const initialState = {
  placesByName: {},
}

export default function user(state = initialState, action) {
  switch (action.type) {

    case SET_WORLD: {
      const placesByName = Object.values(action.world).reduce((acc, place) => {
        if (!acc[place.name]) {
          acc[place.name] = [place]
        } else {
          acc[place.name].push(place)
        }
        return acc
      }, {})
      Object.keys(placesByName).map(placeName => {
        if (placesByName[placeName].length > 1) {
          placesByName[placeName].forEach(place => {
            const fullName = place.name + ', ' + place.countryCode
            placesByName[fullName] = [place]
          })
          delete placesByName[placeName]
        }
      }, {})
      return {
        ...state,
        placesByName
      }
    }

    default: {
      return state
    }
  }
}
