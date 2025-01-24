import { z } from 'zod'
import logger from '../shared/logger.js'

const registrationSchema = z.object({
  display_name: z.string().min(1, {
    message: 'Display name is required and must be at least 1 character long'
  }),
  email: z
    .string()
    .email({ message: 'Email is required and must be a valid email address' }),
  password: z.string().min(8, {
    message: 'Password is required and must be at least 8 characters long'
  })
})

function validateRegistration(req, res, next) {
  try {
    if (!req.body) {
      logger.error('Request body is missing')
      return res
        .status(400)
        .json({ error: 'Bad Request', message: 'Request body is missing' })
    }
    const validatedData = registrationSchema.parse(req.body)
    req.validatedData = validatedData
    next()
  } catch (error) {
    const details = error.errors.map((err) => ({
      code: err.code,
      expected: err.expected,
      received: err.received,
      path: err.path,
      message: err.message
    }))

    logger.error({ validationError: details }, 'Validation error')
    return res.status(400).json({ error: 'Bad Request', message: details })
  }
}

const loginSchema = z.object({
  email: z
    .string()
    .email({ message: 'Email is required and must be a valid email address' }),
  password: z.string().min(8, {
    message: 'Password is required and must be at least 8 characters long'
  })
})

function validateLogin(req, res, next) {
  try {
    if (!req.body) {
      logger.error('Request body is missing')
      return res
        .status(400)
        .json({ error: 'Bad Request', message: 'Request body is missing' })
    }
    const validatedData = loginSchema.parse(req.body)
    req.validatedData = validatedData
    next()
  } catch (error) {
    const details = error.errors.map((err) => ({
      code: err.code,
      expected: err.expected,
      received: err.received,
      path: err.path,
      message: err.message
    }))

    logger.error({ validationError: details }, 'Validation error')
    return res.status(400).json({ error: 'Bad Request', message: details })
  }
}

export { validateRegistration, validateLogin }
