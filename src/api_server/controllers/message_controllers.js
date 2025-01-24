import { pool } from '../shared/db.js'
import logger from '../shared/logger.js'

async function listMessagesController(req, res) {
  try {
    const { roomName, isDesc, pageNo, pageSize } = req.query

    // Ensure isDesc is either 'true' or 'false'
    const sortOrder = isDesc === 'true' ? 'DESC' : 'ASC'

    const getMessagesQuery = `
      SELECT 
        m.id AS message_id,
        m.message,
        m.user_id,
        m.room_name,
        m.created_at AS message_created_at,
        m.updated_at AS message_updated_at,
        media.id AS media_id,
        media.file_path,
        media.created_at AS media_created_at,
        media.updated_at AS media_updated_at
      FROM messages m
      LEFT JOIN medias media ON m.media_id = media.id
      WHERE m.room_name = $1 AND m.deleted_at IS NULL AND media.deleted_at IS NULL
      ORDER BY m.created_at ${sortOrder}
      LIMIT $2
      OFFSET $3;
    `

    const countMessagesQuery = `
      SELECT COUNT(*) FROM messages WHERE room_name = $1 AND deleted_at IS NULL;
    `

    const [messagesResult, countResult] = await Promise.all([
      pool.query(getMessagesQuery, [
        roomName,
        pageSize,
        (pageNo - 1) * pageSize
      ]),
      pool.query(countMessagesQuery, [roomName])
    ])
    const messages = messagesResult.rows
    const totalRecordCount = countResult.rows[0].count

    res.status(200).json({
      messages,
      pagination: {
        page_number: pageNo,
        page_size: pageSize,
        total_record_count: totalRecordCount
      }
    })
  } catch (error) {
    logger.error(
      { listMessagesError: error.message },
      'Error during list message'
    )
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

export { listMessagesController }
