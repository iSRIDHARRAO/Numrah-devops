import { verifyToken } from '../shared/auth.js'
import { pool } from '../shared/db.js'

const authenticateSocket = async (socket, next) => {
  const token = socket.handshake.query.token

  if (!token) {
    return next(new Error('Authentication error: Token not provided'))
  }

  try {
    // Verify the token using the provided verifyToken function
    const decodedToken = verifyToken(token)

    await authenticateAndCheckBanStatus(decodedToken.userId)
    // Attach the decoded token to the socket for further use
    socket.decoded = decodedToken
    next()
  } catch (error) {
    if (error.message) {
      return next(new Error(error.message))
    } else {
      return next(new Error('Authentication error: Invalid token'))
    }
  }
}

async function authenticateAndCheckBanStatus(userId) {
  const user = await pool.query(
    'SELECT id, status, ban_until FROM users WHERE id = $1 AND deleted_at IS NULL',
    [userId]
  )

  if (user.rows.length === 0) {
    throw { message: 'User not found' }
  }

  const userInfo = user.rows[0]
  const { id, status, ban_until } = userInfo

  if (status === 'temp_ban') {
    const currentDate = new Date()

    if (ban_until && currentDate < new Date(ban_until)) {
      // User is temporarily banned
      throw {
        status: 401,
        message: `You are banned until ${new Date(ban_until).toLocaleString()}`
      }
    } else {
      // Reset temporary ban
      await pool.query(
        'UPDATE users SET ban_until = NULL, status = $2 WHERE id = $1',
        [id, 'active']
      )
      // Updating the reference instead of re-fetching the data from DB
      user.rows[0].status = 'active'
      user.rows[0].ban_until = null
    }
  } else if (status === 'perma_ban') {
    // User is permanently banned
    throw { status: 401, message: 'You are permanently banned' }
  }
}

export { authenticateSocket }
