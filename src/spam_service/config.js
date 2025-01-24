import path from 'path'
import dotenv from 'dotenv'

const envPath = path.resolve(process.cwd(), '..', '.env')
dotenv.config({ path: envPath })

const config = Object.freeze({
  ENV: process.env.ENV || 'dev',
  DB_USER: process.env.DB_USER || 'db_user',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_NAME: process.env.DB_NAME || 'db_name',
  DB_PASSWORD: process.env.DB_PASSWORD || 'db_password',
  DB_PORT: process.env.DB_PORT || 5432,
  NATS_URL: process.env.NATS_URL || 'localhost:4222'
})

export default config
