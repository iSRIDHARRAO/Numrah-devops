import jwt from 'jsonwebtoken'
import logger from '../shared/logger.js'
import { pool } from '../shared/db.js'
import config from '../config.js'
import { authenticateAndCheckBanStatus } from '../controllers/auth_controllers.js'

function accessTokenMiddleware(req, res, next) {
  try {
    const authHeader = req.headers['authorization']
    const accessToken = authHeader && authHeader.split(' ')[1]

    if (!accessToken) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'Access token is missing' })
    }

    const user = jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET)

    // Attach the user information to the request for further use
    req.user = user
    next()
  } catch (error) {
    logger.error(error, 'Error validating access token')

    return res
      .status(403)
      .json({ error: 'Forbidden', message: 'Invalid access token' })
  }
}

async function authenticateMiddleware(req, res, next) {
  try {
    const user = await pool.query(
      'SELECT id, email, password, display_name, gender, avatar, status, ban_until, created_at, updated_at FROM users WHERE id = $1 AND deleted_at IS NULL',
      [req.user.userId]
    )

    try {
      // Check for banned status
      await authenticateAndCheckBanStatus(user, res)
      next()
    } catch (error) {
      // Handle errors and send the appropriate response
      const { status, message } = error
      return res.status(status).json({ error: 'Unauthorized', message })
    }
  } catch (error) {
    logger.error(error)
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    })
  }
}

export { authenticateMiddleware, accessTokenMiddleware }
