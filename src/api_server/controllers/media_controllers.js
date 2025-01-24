import { pool } from '../shared/db.js'
import logger from '../shared/logger.js'

async function createMediaController(req, res) {
  try {
    // Save the file information to the Medias table
    const insertQuery = `
      INSERT INTO medias (user_id, file_path, created_at, updated_at, deleted_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL)
      RETURNING *;
    `

    const values = [req.user.userId, req.file?.filename]
    const result = await pool.query(insertQuery, values)

    res.status(201).json(result.rows[0])
  } catch (error) {
    logger.error(
      { createMediaError: error.message },
      'Error during media upload'
    )
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

export { createMediaController }
