import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import logger from './shared/logger.js'
import loggerMiddleware from './middlewares/logger_middleware.js'
import { pool, createAllTablesAndIndexes } from './shared/db.js'
import config from './config.js'
import authRoutes from './routes/auth_routes.js'
import userRoutes from './routes/user_routes.js'
import mediaRoutes from './routes/media_routes.js'
import messageRoutes from './routes/messages_routes.js'
import friendRoutes from './routes/friend_routes.js'
import { closeNATSConnection } from './shared/nats.js'

const app = express()
const port = config.PORT

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors())
app.use(loggerMiddleware)

createAllTablesAndIndexes()

app.use('/auth', authRoutes)
app.use('/user', userRoutes)
app.use('/media', mediaRoutes)
app.use('/message', messageRoutes)
app.use('/friend', friendRoutes)

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource could not be found'
  })
})

const server = app.listen(port, () => {
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
