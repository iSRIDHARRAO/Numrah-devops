import { connect } from 'nats'
import logger from './logger.js'
import config from '../config.js'

const nc = await connect({ servers: config.NATS_URL })

async function closeNATSConnection() {
  if (nc) {
    await nc.close()
    logger.info('NATS connection closed')
  }
}

export { nc, closeNATSConnection }
