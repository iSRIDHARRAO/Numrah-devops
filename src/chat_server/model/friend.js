import { pool } from '../shared/db.js'
import logger from '../shared/logger.js'

async function insertFriendData(user1Id, user2Id, roomName) {
  const insertQuery = `
      INSERT INTO friends (user1_id, user2_id, room_name)
      VALUES ($1, $2, $3)
      RETURNING id, created_at;
    `

  try {
    const result = await pool.query(insertQuery, [user1Id, user2Id, roomName])
    const insertedFriend = result.rows[0]
    logger.info('Friend data inserted successfully', insertedFriend)
    return insertedFriend
  } catch (error) {
    logger.error(error, 'Error inserting friend data')
    throw error
  }
}

async function areUsersFriends(user1Id, user2Id) {
  const checkQuery = `
    SELECT EXISTS (
      SELECT 1 FROM friends
      WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1) AND deleted_at IS NULL
    ) AS are_friends;
  `

  try {
    const client = await pool.connect()
    const result = await client.query(checkQuery, [user1Id, user2Id])
    const areFriends = result.rows[0].are_friends
    logger.info(`Are users ${user1Id} and ${user2Id} friends? ${areFriends}`)
    return areFriends
  } catch (error) {
    logger.error(error, 'Error checking friendship status')
    throw error
  }
}

export { areUsersFriends, insertFriendData }
