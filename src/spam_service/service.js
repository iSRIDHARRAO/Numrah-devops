import { connect, StringCodec } from 'nats'
import logger from './shared/logger.js'
import { pool } from './shared/db.js'
import { analyzeText } from './analyze/analyze.js'
import config from './config.js'

let nc = null
const sc = StringCodec()

async function connectToNats() {
  nc = await connect({ servers: config.NATS_URL })
  logger.info('Connected to NATS Server')

  const sub = nc.subscribe('spam_service')
  ;(async () => {
    for await (const m of sub) {
      const { type, data } = JSON.parse(sc.decode(m.data))
      switch (type) {
        case 'analyze':
          analyzeText(data)
      }
    }
    logger.info('subscription closed')
  })()
}
connectToNats()

async function closeNATSConnection() {
  if (nc) {
    await nc.close()
    logger.info('NATS connection closed')
  }
}

process.on('SIGINT', () => {
  shutdown('SIGINT')
})

process.on('SIGTERM', () => {
  shutdown('SIGTERM')
})

async function shutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`)

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

    logger.info('Server and database connection pool closed. Exiting process.')
    process.exit(0)
  })
  process.exit(0)
}
