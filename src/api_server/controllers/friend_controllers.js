import { pool } from '../shared/db.js'
import logger from '../shared/logger.js'

async function listFriendsController(req, res) {
  try {
    const { pageNo, pageSize } = req.query
    const currentUserId = req.user.userId

    // Query to fetch friends with pagination
    const friendsQuery = `
      SELECT 
        id,
        user1_id,
        user2_id,
        room_name,
        created_at,
        updated_at
      FROM friends
      WHERE (user1_id = $1 OR user2_id = $1) AND deleted_at IS NULL
      LIMIT $2
      OFFSET $3;
    `

    // Query to count total friends
    const countFriendsQuery = `
      SELECT COUNT(*) 
      FROM friends 
      WHERE (user1_id = $1 OR user2_id = $1) AND deleted_at IS NULL;
    `
    const [friendsResult, countResult] = await Promise.all([
      pool.query(friendsQuery, [
        currentUserId,
        pageSize,
        (pageNo - 1) * pageSize
      ]),
      await pool.query(countFriendsQuery, [currentUserId])
    ])

    // Log information using logger.info
    logger.info(
      `List of friends for user ${currentUserId}, Page: ${pageNo}, Size: ${pageSize}`
    )

    // Send the response
    res.status(200).json({
      friends: friendsResult.rows,
      pagination: {
        page_number: pageNo,
        page_size: pageSize,
        total_record_count: countResult.count
      }
    })
  } catch (error) {
    logger.error(
      { listFriendsError: error.message },
      'Error during list friends'
    )
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

export { listFriendsController }
