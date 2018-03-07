import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStreamTrack,
  getUserMedia
} from 'react-native-webrtc'
import { Platform } from 'react-native'

import { store } from './app'
import { updateStatus, addStream, removeStream, setSelf } from '../actions/stream.action'

import io from 'socket.io-client'
const socket = io.connect('http://localhost:4443', {
  query: `jwt=${store.getState().auth.jwt}`,
  transports: ['websocket']
})

const configuration = { iceServers: [{ url: 'stun:stun.l.google.com:19302' }] }

const pcPeers = {}
let localStream

function logError (error) {
  console.log('logError', error)
}

function getLocalStream (isFront, callback) {
  let videoSourceId

  // on android, you don't have to specify sourceId manually, just use facingMode
  // uncomment it if you want to specify
  if (Platform.OS === 'ios') {
    MediaStreamTrack.getSources(sourceInfos => {
      for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i]
        if (
          sourceInfo.kind === 'video' &&
          sourceInfo.facing === (isFront ? 'front' : 'back')
        ) {
          videoSourceId = sourceInfo.id
        }
      }
    })
  }
  getUserMedia(
    {
      audio: true,
      // video: false
      video: {
        mandatory: {
          minWidth: 640, // Provide your own width, height and frame rate here
          minHeight: 360,
          minFrameRate: 30
        },
        facingMode: isFront ? 'user' : 'environment',
        optional: videoSourceId ? [{ sourceId: videoSourceId }] : []
      }
    },
    function (stream) {
      callback(stream)
    },
    err => console.log('er', err)
  )
}

function join (roomID, callback) {
  socket.emit('join', roomID, function (socketIds) {
    for (const i in socketIds) {
      const socketId = socketIds[i]
      createPC(socketId, true)
    }
    callback(socketIds)
  })
}

function createPC (socketId, isOffer) {
  const pc = new RTCPeerConnection(configuration)
  pcPeers[socketId] = pc

  pc.onicecandidate = function (event) {
    if (event.candidate) {
      socket.emit('exchange', { to: socketId, candidate: event.candidate })
    }
  }

  function createOffer () {
    pc.createOffer(function (desc) {
      pc.setLocalDescription(
        desc,
        function () {
          socket.emit('exchange', { to: socketId, sdp: pc.localDescription })
        },
        logError
      )
    }, logError)
  }

  pc.onnegotiationneeded = function () {
    if (isOffer) {
      createOffer()
    }
  }

  pc.oniceconnectionstatechange = function (event) {
    if (event.target.iceConnectionState === 'completed') {
      setTimeout(() => {
        getStats()
      }, 1000)
    }
    if (event.target.iceConnectionState === 'connected') {
      createDataChannel()
    }
  }
  pc.onsignalingstatechange = function (event) {
    console.log('onsignalingstatechange', event.target.signalingState)
  }

  pc.onaddstream = function (event) {
    store.dispatch(updateStatus('One peer join!'))

    store.dispatch(addStream({
      id: socket.id,
      name: socketId,
      url: event.stream.toURL(),
      chats: []
    }))
  }
  pc.onremovestream = function (event) {
    console.log('onremovestream', event.stream)
  }

  pc.addStream(localStream)
  function createDataChannel () {
    if (pc.textDataChannel) {
      return
    }
    const dataChannel = pc.createDataChannel('text')

    dataChannel.onerror = function (error) {
      console.log('dataChannel.onerror', error)
    }

    dataChannel.onmessage = function (event) {
      console.log('dataChannel.onmessage:', event.data)
      // container.receiveTextData({ user: socketId, message: event.data })
    }

    dataChannel.onopen = function () {
      console.log('dataChannel.onopen')
      // container.setState({ textRoomConnected: true })
    }

    dataChannel.onclose = function () {
      console.log('dataChannel.onclose')
    }

    pc.textDataChannel = dataChannel
  }
  return pc
}

function exchange (data) {
  const fromId = data.from
  let pc
  if (fromId in pcPeers) {
    pc = pcPeers[fromId]
  } else {
    pc = createPC(fromId, false)
  }

  if (data.sdp) {
    pc.setRemoteDescription(
      new RTCSessionDescription(data.sdp),
      function () {
        if (pc.remoteDescription.type === 'offer') {
          pc.createAnswer(function (desc) {
            pc.setLocalDescription(
              desc,
              function () {
                socket.emit('exchange', {
                  to: fromId,
                  sdp: pc.localDescription
                })
              },
              logError
            )
          }, logError)
        }
      },
      logError
    )
  } else {
    pc.addIceCandidate(new RTCIceCandidate(data.candidate))
  }
}

function leave (socketId) {
  const pc = pcPeers[socketId]
  // const viewIndex = pc.viewIndex
  pc.close()
  delete pcPeers[socketId]

  store.dispatch(removeStream(socketId))
  store.dispatch(updateStatus('One peer leave!'))
}

socket.on('exchange', function (data) {
  exchange(data)
})
socket.on('leave', function (socketId) {
  leave(socketId)
})

socket.on('connect', function (data) {
  getLocalStream(true, function (stream) {
    localStream = stream
    store.dispatch(setSelf(stream.toURL()))
  })
})

function mapHash (hash, func) {
  const array = []
  for (const key in hash) {
    const obj = hash[key]
    array.push(func(obj, key))
  }
  return array
}

function getStats () {
  const pc = pcPeers[Object.keys(pcPeers)[0]]
  if (
    pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]
  ) {
    const track = pc.getRemoteStreams()[0].getAudioTracks()[0]
    pc.getStats(
      track,
      function (report) {
        console.log('getStats report', report)
      },
      logError
    )
  }
}

module.exports = {
  join,
  getStats,
  mapHash
}
