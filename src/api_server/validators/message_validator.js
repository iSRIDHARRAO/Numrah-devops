import { z } from 'zod'
import logger from '../shared/logger.js'

const listMessageSchema = z.object({
  roomName: z.string(),
  isDesc: z
    .string()
    .refine((value) => ['true', 'false'].includes(value.toLowerCase()), {
      message: 'isDesc must be a valid boolean string ("true" or "false")'
    })
    .transform((value) => value.toLowerCase() === 'true'),
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

function validateListMessages(req, res, next) {
  try {
    // Validate the request query parameters against the listMessageSchema
    listMessageSchema.parse(req.query)
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

export { validateListMessages }
