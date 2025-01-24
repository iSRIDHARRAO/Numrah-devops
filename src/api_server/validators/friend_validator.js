import { z } from 'zod'
import logger from '../shared/logger.js'

const listFriendsSchema = z.object({
  pageNo: z
    .string()
    .refine((value) => !isNaN(Number(value)), {
      message: 'Page number must be a valid number'
    })
    .transform((value) => Number(value)),
  pageSize: z
    .string()
    .refine((value) => !isNaN(Number(value)), {
      message: 'Page size must be a valid number'
    })
    .transform((value) => Number(value))
})

function validateListFriends(req, res, next) {
  try {
    // Validate the request query parameters against the listFriendsSchema
    listFriendsSchema.parse(req.query)
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

export { validateListFriends }
