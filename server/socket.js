import express from 'express'
import http from 'http'
import jsonwebtoken from 'jsonwebtoken'

import { User } from './data/connectors'
import { JWT_SECRET } from './config'

const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server)

const ONLINE_USERS = {}

server.listen(4443, () => console.log('Socket running'))

function socketIdsInRoom (roomId) {
  const socketIds = io.nsps['/'].adapter.rooms[roomId]
  if (socketIds) {
    return Object.keys(socketIds)
  } else {
    return []
  }
}

io.on('connection', function (socket) {
  const jwt = socket.handshake.query.jwt
  const userPromise = new Promise((resolve, reject) => {
    if (jwt) {
      jsonwebtoken.verify(
        jwt,
        JWT_SECRET,
        (err, decoded) => {
          if (err) {
            reject(new Error('Invalid Token'))
          }

          resolve(
            User.findOne({
              where: { id: decoded.id, version: decoded.version }
            })
          )
        }
      )
    } else {
      reject(new Error('No Token'))
    }
  })

  userPromise.then(user => {
    if (user) {
      ONLINE_USERS[socket.id] = user.id
    } else {
      console.log('Unkown user connected at ' + socket.id)
    }
  })

  setInterval(() => {
    socket.emit('usersOnline', ONLINE_USERS)
  }, 1000)

  socket.on('disconnect', function () {
    if (socket.room) {
      const room = socket.room
      io.to(room).emit('leave', socket.id)
      socket.leave(room)
      delete ONLINE_USERS[socket.id]
    }
  })

  socket.on('join', function (roomId, callback) {
    var socketIds = socketIdsInRoom(roomId)
    callback(socketIds)
    socket.join(roomId)
    socket.room = roomId
  })

  socket.on('exchange', function (data) {
    data.from = socket.id
    const to = io.sockets.connected[data.to]
    to.emit('exchange', data)
  })
})
