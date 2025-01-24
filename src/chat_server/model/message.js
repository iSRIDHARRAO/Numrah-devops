import { pool } from '../shared/db.js'
import logger from '../shared/logger.js'
import { nc } from '../shared/nats.js'

async function insertMessage(message, userId, roomName, file = null) {
  const insertQuery = `
        INSERT INTO messages (message, user_id, room_name, media_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, message, user_id, room_name, media_id, created_at, updated_at;
      `

  try {
    const client = await pool.connect()
    const result = await client.query(insertQuery, [
      message,
      userId,
      roomName,
      file?.id
    ])
    const insertedMessage = result.rows[0]
    logger.info('Message inserted successfully')
    logger.info(insertedMessage)
    const payload = JSON.stringify({
      type: 'analyze',
      data: {
        userId,
        message,
        roomName,
        file
      }
    })
    nc.publish('spam_service', payload)
  } catch (error) {
    logger.error(
      { createMessageError: error.message },
      'Error during inserting message'
    )
  }
}

export { insertMessage }
