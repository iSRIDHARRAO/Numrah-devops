import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import fs from 'fs/promises'
import { join } from 'path'
import { pool } from '../shared/db.js'
import config from '../config.js'
import logger from '../shared/logger.js'
import { uploadDirectory } from '../shared/upload.js'

async function registerController(req, res) {
  const { display_name, email, password } = req.validatedData

  // Check if the user with the given email already exists
  const userWithEmail = await pool.query(
    'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  )

  if (userWithEmail.rows.length > 0) {
    // User with the given email already exists
    return res.status(409).json({
      error: 'Conflict',
      message: 'User with this email already exists'
    })
  }

  // Hash the password using bcrypt
  const hashedPassword = await bcrypt.hash(password, 10)

  // Insert user into the users table
  const insertUserQuery = `
    INSERT INTO users (display_name, email, password, gender, status, avatar)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, display_name, email, created_at;
  `

  try {
    const client = await pool.connect()
    const result = await client.query(insertUserQuery, [
      display_name,
      email,
      hashedPassword,
      null,
      'active',
      null
    ])

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: result.rows[0].id, displayName: result.rows[0].display_name },
      config.ACCESS_TOKEN_SECRET,
      { expiresIn: '60m' }
    )
    const refreshToken = jwt.sign(
      { userId: result.rows[0].id, displayName: result.rows[0].display_name },
      config.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    )

    // Set the refresh token as an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    // Return the access token in the response
    res.json({ accessToken, user: result.rows[0] })
  } catch (error) {
    logger.error(
      { registrationError: error.message },
      'Error during registration'
    )
    res
      .status(500)
      .json({ error: 'Registration Failed', message: 'Internal Server Error' })
  }
}

async function loginController(req, res) {
  try {
    const { email, password } = req.validatedData

    // Check if the user with the given email exists
    const user = await pool.query(
      'SELECT id, email, password, display_name, gender, avatar, status, ban_until, created_at, updated_at FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    )

    try {
      // Check for banned status
      await authenticateAndCheckBanStatus(user, res)
    } catch (error) {
      // Handle errors and send the appropriate response
      const { status, message } = error
      return res.status(status).json({ error: 'Unauthorized', message })
    }
    const userInfo = user.rows[0]
    const { id: userId, display_name } = userInfo

    // Match the hashed password
    const passwordMatch = await bcrypt.compare(password, userInfo.password)

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'Invalid email or password' })
    }

    // Generate and return an access token
    const accessToken = jwt.sign(
      { userId: userId, displayName: display_name },
      config.ACCESS_TOKEN_SECRET,
      { expiresIn: '60m' }
    )

    // Set the refresh token as an HTTP-only cookie
    const refreshToken = jwt.sign(
      { userId: userId, displayName: display_name },
      config.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    )
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    // Filling the avatar data in payload as base64 if it exist
    const existingAvatarName = userInfo.avatar

    let avatarContent = null
    if (existingAvatarName) {
      const avatarPath = join(uploadDirectory, existingAvatarName)
      avatarContent = await fs.readFile(avatarPath)
      userInfo.avatar = avatarContent.toString('base64')
    }

    delete userInfo.password

    res.json({ accessToken, user: userInfo })
  } catch (error) {
    logger.error({ loginError: error.message }, 'Error during login')
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function refreshController(req, res) {
  try {
    // Extract the refresh token from the HTTP-only cookie
    const refreshToken = req.cookies['refreshToken']

    // Check if the refresh token exists
    if (!refreshToken) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'Refresh token not provided' })
    }

    // Verify the refresh token
    const decodedToken = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET)

    // Check if the user with the given email exists
    const user = await pool.query(
      'SELECT id, email, password, display_name, gender, avatar, status, ban_until, created_at, updated_at FROM users WHERE id = $1 AND deleted_at IS NULL',
      [decodedToken.userId]
    )

    try {
      // Check for banned status
      await authenticateAndCheckBanStatus(user, res)
    } catch (error) {
      // Handle errors and send the appropriate response
      const { status, message } = error
      return res.status(status).json({ error: 'Unauthorized', message })
    }
    const userInfo = user.rows[0]

    // Generate and return an access token
    const accessToken = jwt.sign(
      { userId: userInfo.id, displayName: userInfo.display_name },
      config.ACCESS_TOKEN_SECRET,
      { expiresIn: '60m' }
    )

    // Set the refresh token as an HTTP-only cookie
    const newRefreshToken = jwt.sign(
      { userId: userInfo.id, displayName: userInfo.display_name },
      config.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    )
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({ accessToken })
  } catch (error) {
    logger.error(
      { refreshError: error.message },
      'Error while refreshing token'
    )
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function logoutController(req, res) {
  try {
    // Clear the refresh token by setting it to null
    res.clearCookie('refreshToken')

    res.json({ success: true })
  } catch (error) {
    logger.error({ logoutError: error.message }, 'Error during logout')
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function authenticateAndCheckBanStatus(user, res) {
  if (user.rows.length === 0) {
    throw {
      status: 401,
      message: 'User not found. Check your email and password'
    }
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

export {
  registerController,
  loginController,
  refreshController,
  logoutController,
  authenticateAndCheckBanStatus
}
