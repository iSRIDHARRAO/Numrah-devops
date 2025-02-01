import path from 'path'
import dotenv from 'dotenv'

const envPath = path.resolve('/tmp/','.env')
dotenv.config({ path: envPath })

const config = Object.freeze({
  ENV: process.env.ENV || 'dev',
  PORT: process.env.CHAT_SERVER_PORT || 3001,
  DB_USER: process.env.DB_USER || 'db_user',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_NAME: process.env.DB_NAME || 'db_name',
  DB_PASSWORD: process.env.DB_PASSWORD || 'db_password',
  DB_PORT: process.env.DB_PORT || 5432,
  NATS_URL: process.env.NATS_URL || 'localhost:4222',
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || '123456'
})

export default config
