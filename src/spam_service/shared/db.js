import pg from 'pg'
import logger from './logger.js'
import config from '../config.js'

const { Pool } = pg

// You can load these values from your .env file
const pool = new Pool({
  user: config.DB_USER,
  host: config.DB_HOST,
  database: config.DB_NAME,
  password: config.DB_PASSWORD,
  port: config.DB_PORT
})

// Handle pool errors
pool.on('error', (err) => {
  logger.error(err, 'PostgreSQL pool error')
  process.exit(-1)
})

export { pool }
