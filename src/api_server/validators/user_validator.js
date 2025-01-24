import { z } from 'zod'
import logger from '../shared/logger.js'

const userUpdateSchema = z.object({
  email: z
    .string()
    .email({ message: 'Email must be a valid email address' })
    .optional(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .optional(),
  display_name: z
    .string()
    .min(1, { message: 'Display name must be at least 1 character long' })
    .optional(),
  gender: z
    .enum(['Male', 'Female', 'Others'], { message: 'Invalid gender' })
    .optional(),
  avatar: z.unknown().optional()
})

function validateUserUpdate(req, res, next) {
  try {
    if (!req.body) {
      logger.error('Request body is missing')
      return res
        .status(400)
        .json({ error: 'Bad Request', message: 'Request body is missing' })
    }
    const { email, password, display_name, gender, avatar } = req.body

    req.validatedData = userUpdateSchema.parse({
      email: email || undefined,
      password: password || undefined,
      display_name: display_name || undefined,
      gender: gender || undefined,
      avatar: avatar || undefined
    })

    next()
  } catch (error) {
    logger.error({ validationError: error }, 'User update validation error')
    res.status(400).json({ error: 'Bad Request', details: error })
  }
}

export { validateUserUpdate }
