import Immutable from 'seamless-immutable'

import {
  LOGOUT,
  SET_STREAMS,
  SET_CURRENT_STREAM,
  ADD_STREAM,
  REMOVE_STREAM,
  UPDATE_STATUS,
  SET_SELF
} from '../constants/constants'

const initialState = Immutable({
  streams: [],
  activeStreamId: null,
  status: 'ready',
  selfViewSrc: null
})

const stream = (state = initialState, action) => {
  switch (action.type) {
    case SET_CURRENT_STREAM:
      return state.merge({ activeStreamId: action.activeStreamId })
    case SET_STREAMS:
      return state.merge({ streams: action.streams })
    case UPDATE_STATUS:
      return state.merge({ status: action.text })
    case SET_SELF:
      console.log('set-self', action.url)
      return state.merge({ selfViewSrc: action.url })
    case ADD_STREAM:
      return state.merge({ streams: [...state.streams, action.stream] })
    case REMOVE_STREAM:
      return state.merge({
        streams: state.streams.filter(s => s.id !== action.streamId)
      })
    case LOGOUT:
      return Immutable({ streams: [], activeStreamId: null })
    default:
      return state
  }
}

export default stream
