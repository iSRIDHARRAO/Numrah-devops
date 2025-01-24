import express from 'express'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'
import logger from './shared/logger.js'
import { pool } from './shared/db.js'
import config from './config.js'
import { closeNATSConnection } from './shared/nats.js'
import { handleConnection } from './sockets/socket_manager.js'
import { authenticateSocket } from './sockets/auth.js'

const app = express()
const server = http.createServer(app)
const io = new Server(server)
const port = config.PORT

app.use(express.static('public'))
app.use(cors())

io.use(authenticateSocket)
io.on('connection', (socket) => {
  handleConnection(socket, io)
})

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource could not be found'
  })
})

server.listen(port, () => {
  logger.info(`Server is running at http://localhost:${port}`)
})

process.on('SIGINT', () => {
  shutdown('SIGINT')
})

process.on('SIGTERM', () => {
  shutdown('SIGTERM')
})

function shutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`)

  server.close((err) => {
    if (err) {
      logger.error(err, 'Error while closing the server')
      process.exit(1)
    }

    // Close the PostgreSQL connection pool
    pool.end(async (poolErr) => {
      if (poolErr) {
        logger.error(
          poolErr,
          'Error while closing the PostgreSQL connection pool'
        )
        process.exit(1)
      }

      try {
        await closeNATSConnection()
      } catch (error) {
        logger.error(
          { error: error.message },
          'Error occured while close NATS connection'
        )
        process.exit(1)
      }

      logger.info(
        'Server and database connection pool closed. Exiting process.'
      )
      process.exit(0)
    })
  })
}
