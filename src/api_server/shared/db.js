import pg from 'pg'
import logger from './logger.js'
import config from '../config.js'

const { Pool } = pg

// You can load these values from your config file
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

// Migrations

// Function to create ENUM types if they don't exist
async function createEnumTypes() {
  const createEnumQuery = `
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_enum') THEN
        CREATE TYPE gender_enum AS ENUM ('Male', 'Female', 'Others');
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_enum') THEN
        CREATE TYPE status_enum AS ENUM ('active', 'temp_ban', 'perma_ban');
      END IF;
    END $$;
  `

  try {
    await pool.query(createEnumQuery);
    logger.info('gender_enum and status_enum created successfully')
  } catch (error) {
    logger.error(error, 'Error creating ENUM types')
  }
}

// Function to create the Users table
async function createUsersTable() {
  await createEnumTypes() // Ensure ENUM types exist before creating the table

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      display_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      gender gender_enum DEFAULT NULL,
      status status_enum NOT NULL,
      avatar VARCHAR(255) DEFAULT NULL,
      ban_until TIMESTAMPTZ DEFAULT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMPTZ DEFAULT NULL
    );
  `

  try {
    await pool.query(createTableQuery)
    logger.info('Users table created successfully')
  } catch (error) {
    logger.error(error, 'Error creating Users table')
  }
}

// Function to create the Users indexes
async function createUsersIndexes() {
  const createIndexQueries = [
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
    'CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);',
    'CREATE INDEX IF NOT EXISTS idx_users_ban_until ON users(ban_until);'
  ]

  try {
    // Execute each index creation query
    await Promise.all(createIndexQueries.map((query) => pool.query(query)))

    logger.info('Indexes for Users table created successfully')
  } catch (error) {
    logger.error(error, 'Error creating indexes for Users table')
  }
}

// Function to create the Medias table
async function createMediaTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS medias (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      CONSTRAINT fk_user
        FOREIGN KEY(user_id) REFERENCES users(id),
      file_path VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMPTZ DEFAULT NULL
    );
  `

  try {
    await pool.query(createTableQuery)
    logger.info('Medias table created successfully')
  } catch (error) {
    logger.error(error, 'Error creating Medias table')
  }
}

// Function to create the Messages table
async function createMessageTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      message TEXT NOT NULL,
      user_id INTEGER,
      CONSTRAINT fk_user
        FOREIGN KEY(user_id) REFERENCES users(id),
      room_name VARCHAR(255),
      is_spam BOOLEAN DEFAULT false,
      media_id INTEGER,
      CONSTRAINT fk_media
        FOREIGN KEY(media_id) REFERENCES medias(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMPTZ DEFAULT NULL
    );
  `

  try {
    await pool.query(createTableQuery)
    logger.info('Messages table created successfully')
  } catch (error) {
    logger.error(error, 'Error creating Messages table')
  }
}

// Function to create the Messages Indexes
async function createMessageIndexes() {
  const createIndexQuery = `
    CREATE INDEX IF NOT EXISTS idx_messages_message ON messages(message);
    CREATE INDEX IF NOT EXISTS idx_messages_room_name ON messages(room_name);
  `

  try {
    await pool.query(createIndexQuery)
    logger.info('Indexes for Messages table created successfully')
  } catch (error) {
    logger.error(error, 'Error creating indexes for Messages table')
  }
}

// Function to create the Friends table
async function createFriendsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS friends (
      id SERIAL PRIMARY KEY,
      user1_id INTEGER NOT NULL,
      user2_id INTEGER NOT NULL,
      room_name VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMPTZ DEFAULT NULL,
      CONSTRAINT fk_user1
        FOREIGN KEY(user1_id) REFERENCES users(id),
      CONSTRAINT fk_user2
        FOREIGN KEY(user2_id) REFERENCES users(id)
    );
  `

  try {
    await pool.query(createTableQuery)
    logger.info('Friends table created successfully')
  } catch (error) {
    logger.error(error, 'Error creating Friends table')
  }
}

// Function to create the all the table and indexes
async function createAllTablesAndIndexes() {
  await createUsersTable()
  await createMediaTable()
  await createMessageTable()
  await createFriendsTable()
  await createUsersIndexes()
  await createMessageIndexes()
}

export { pool, createAllTablesAndIndexes }
