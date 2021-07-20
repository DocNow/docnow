import { SET_WEBPAGES, RESET_WEBPAGES, SELECT_WEBPAGE,
         DESELECT_WEBPAGE, SET_WEBPAGE_ARCHIVE, ARCHIVE_ERROR } from '../actions/webpages'

const initialState = []

export default function webpages(state = initialState, action) {

  switch (action.type) {

    case SET_WEBPAGES: {
      return action.webpages
    }

    case RESET_WEBPAGES: {
      return initialState
    }

    case SELECT_WEBPAGE: {
      const i = state.findIndex((w) => {return w.url === action.url})
      if (i >= 0) {
        const w = state[i]
        return [
          ...state.slice(0, i),
          {...w, deselected: false, selected: true},
          ...state.slice(i + 1)
        ]
      } else {
        return state
      }
    }

    case DESELECT_WEBPAGE: {
      const i = state.findIndex((w) => {return w.url === action.url})
      if (i >= 0) {
        const w = state[i]
        return [
          ...state.slice(0, i),
          {...w, selected: false, deselected: true},
          ...state.slice(i + 1)
        ]
      } else {
        return state
      }
    }

    case SET_WEBPAGE_ARCHIVE: {
      const i = state.findIndex((w) => {return w.url === action.url})
      if (i >= 0) {
        const w = state[i]
        return [
          ...state.slice(0, i),
          {
            ...w,
            archive: {
              url: action.archiveUrl,
              time: action.archiveTime
            }
          },
          ...state.slice(i + 1)
        ]
      } else {
        return state
      }
    }

    case ARCHIVE_ERROR: {
      const i = state.findIndex((w) => {return w.url === action.url})
      if (i >= 0) {
        const w = state[i]
        return [
          ...state.slice(0, i),
          {
            ...w,
            archive: {
              error: true
            }
          },
          ...state.slice(i + 1)
        ]
      } else {
        return state
      }
    }

    default: {
      return state
    }

  }

}
