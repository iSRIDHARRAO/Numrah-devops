import fs from 'fs/promises'
import { join } from 'path'
import { pool } from '../shared/db.js'
import logger from '../shared/logger.js'
import { uploadDirectory } from '../shared/upload.js'

async function userUpdateController(req, res) {
  try {
    const userId = req.user.userId
    const { email, password, display_name, gender } = req.validatedData

    const updateUserQuery = `UPDATE users
     SET email = COALESCE($1, email),
         password = COALESCE($2, password),
         display_name = COALESCE($3, display_name),
         gender = COALESCE($4, gender),
         avatar = COALESCE($5, avatar)
     WHERE id = $6
     AND deleted_at IS NULL
     RETURNING id, email, display_name, gender, avatar, created_at, updated_at`

    const result = await pool.query(updateUserQuery, [
      email,
      password,
      display_name,
      gender,
      req.file?.filename,
      userId
    ])

    const existingAvatarName = result.rows[0].avatar

    // Filling the avatar data in payload as base64 if it exist
    let avatarContent = null
    if (existingAvatarName) {
      const avatarPath = join(uploadDirectory, existingAvatarName)
      avatarContent = await fs.readFile(avatarPath)
      result.rows[0].avatar = avatarContent.toString('base64')
    }

    res.json({
      message: 'User data updated successfully',
      user: result.rows[0]
    })
  } catch (error) {
    logger.error(
      { userUpdateError: error.message },
      'Error during user data update'
    )
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function userDeleteController(req, res) {
  try {
    const userId = req.user.userId
    // Update the user's deleted_at field with the current timestamp
    const result = await pool.query(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING *',
      [userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found or already deleted'
      })
    }

    // Provide a success response
    res.json({ message: 'Account deleted successfully' })
  } catch (error) {
    logger.error(
      { userUpdateError: error.message },
      'Error during user data update'
    )
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

export { userUpdateController, userDeleteController }
