import {
  SET_CURRENT_STREAM,
  SET_STREAMS,
  ADD_STREAM,
  REMOVE_STREAM,
  UPDATE_STATUS,
  SET_SELF
} from '../constants/constants'

export const setCurrentStream = activeStreamId => ({
  type: SET_CURRENT_STREAM,
  activeStreamId
})

export const setStreams = streams => ({
  type: SET_STREAMS,
  streams
})

export const addStream = stream => ({
  type: ADD_STREAM,
  stream
})

export const removeStream = streamId => ({
  type: REMOVE_STREAM,
  streamId
})

export const updateStatus = text => ({
  type: UPDATE_STATUS,
  text
})

export const setSelf = url => ({
  type: SET_SELF,
  url
})
