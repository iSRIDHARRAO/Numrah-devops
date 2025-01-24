import { pool } from '../shared/db.js'
import logger from '../shared/logger.js'

async function getMessageCountByBody(userId, messageBody) {
  try {
    const countQuery = `
      SELECT COUNT(*) AS message_count
      FROM messages
      WHERE user_id = $1
        AND message = $2
        AND deleted_at IS NULL;
    `
    const result = await pool.query(countQuery, [userId, messageBody])

    if (result.rows.length > 0) {
      const messageCount = result.rows[0].message_count
      logger.info(
        `User ${userId} has ${messageCount} messages with the same body.`
      )
      return messageCount
    } else {
      logger.info(`User ${userId} has no messages with the specified body.`)
      return 0
    }
  } catch (error) {
    logger.error('Error retrieving message count:', error)
    throw error
  }
}

async function markMessagesAsSpam(userId, messageBody, transaction) {
  try {
    const updateQuery = `
      UPDATE messages
      SET is_spam = true
      WHERE user_id = $1
        AND message = $2
        AND deleted_at IS NULL;
    `

    const result = await transaction.query(updateQuery, [userId, messageBody])

    if (result.rowCount > 0) {
      logger.info(`Successfully marked messages as spam for User ${userId}.`)
    } else {
      logger.info(
        `No messages found for User ${userId} with the specified body.`
      )
    }
  } catch (error) {
    logger.error('Error marking messages as spam:', error)
    throw error
  }
}

async function temporarilyBanUser(userId, transaction) {
  try {
    const banUntil = new Date()
    banUntil.setDate(banUntil.getDate() + 7)

    const result = await transaction.query(
      'UPDATE users SET ban_until = $1, status = $2 WHERE id = $3 AND deleted_at IS NULL RETURNING *',
      [banUntil, 'temp_ban', userId]
    )

    if (result.rows.length > 0) {
      logger.info(`User ${userId} temporarily banned until ${banUntil}`)
    } else {
      logger.error(`Failed to temporarily ban user ${userId}`)
    }
  } catch (error) {
    logger.error('Error while temporarily banning user:', error.message)
  }
}

async function permanentlyBanUser(userId, transaction) {
  try {
    const result = await transaction.query(
      'UPDATE users SET status = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING *',
      ['perma_ban', userId]
    )

    if (result.rows.length > 0) {
      logger.info(`User ${userId} permanently banned.`)
    } else {
      logger.error(`Failed to permanently ban user ${userId}`)
    }
  } catch (error) {
    logger.error('Error while permanently banning user:', error.message)
  }
}

export {
  getMessageCountByBody,
  temporarilyBanUser,
  permanentlyBanUser,
  markMessagesAsSpam
}
