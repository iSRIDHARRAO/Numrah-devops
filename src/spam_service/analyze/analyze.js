import {
  getMessageCountByBody,
  temporarilyBanUser,
  permanentlyBanUser,
  markMessagesAsSpam
} from '../model/message.js'
import logger from '../shared/logger.js'
import { pool } from '../shared/db.js'

async function analyzeText(data) {
  try {
    logger.info(data)
    const { userId, message, file } = data
    const messageCount = await getMessageCountByBody(userId, message)
    const linkRegex = /(http[s]?:\/\/[^\s]+)/gi // Regular expression to match links

    // Check if the message contains a link
    const containsLink = message.match(linkRegex) !== null

    const client = await pool.connect()
    // Check conditions for bans
    if ((containsLink || file) && messageCount > 10) {
      // Temporary ban for 1 week
      try {
        // Transaction begins
        await client.query('BEGIN')

        await temporarilyBanUser(userId, client)
        await markMessagesAsSpam(userId, message, client)

        // Transaction commited
        await client.query('COMMIT')
        logger.info('Transaction committed successfully.')
        logger.info(`User ${userId} temporarily banned for 1 week.`)
      } catch (error) {
        // Rollback
        await client.query('ROLLBACK')
        logger.error('Transaction rolled back:', error)
        throw error
      } finally {
        client.release()
      }
    } else if ((containsLink || file) && messageCount > 20) {
      // Permanent ban
      try {
        // Transaction begins
        await client.query('BEGIN')

        await permanentlyBanUser(userId, client)
        await markMessagesAsSpam(userId, message, client)

        // Transaction commited
        await client.query('COMMIT')
        logger.info('Transaction committed successfully.')
        logger.info(`User ${userId} permanently banned.`)
      } catch (error) {
        // Rollback
        await client.query('ROLLBACK')
        logger.error('Transaction rolled back:', error)
        throw error
      } finally {
        client.release()
      }
    }
  } catch (error) {
    logger.error('Error Analysing messages', error)
    logger.error(error)
    console.error(error)
  }
}

export { analyzeText }
