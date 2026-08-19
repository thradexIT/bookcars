import { Server, Socket } from 'socket.io'
import http from 'node:http'
import https from 'node:https'
import * as logger from '../utils/logger'

let io: Server | null = null

export const init = (server: http.Server | https.Server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // We allow all origins for the websockets for simplicity
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket: Socket) => {
    socket.on('join', (userId: string) => {
      socket.join(userId)
      logger.info(`Socket User ${userId} joined room`)
    })
    
    socket.on('leave', (userId: string) => {
      socket.leave(userId)
      logger.info(`Socket User ${userId} left room`)
    })
    
    socket.on('disconnect', () => {
    })
  })
}

export const notifyUser = (userId: string, notificationMessage: string) => {
  if (io) {
    io.to(userId).emit('notification', { message: notificationMessage })
  }
}

export const notifyBookingUpdated = (bookingId: string) => {
  if (io) {
    io.emit('booking-updated', { bookingId })
  }
}

export const notifyBookingCreated = (bookingId: string) => {
  if (io) {
    io.emit('booking-created', { bookingId })
  }
}

export const notifyBookingDeleted = (bookingId: string) => {
  if (io) {
    io.emit('booking-deleted', { bookingId })
  }
}
