import { Router } from 'express'
import { listMessagesController } from '../controllers/message_controllers.js'
import { validateListMessages } from '../validators/message_validator.js'
import {
  authenticateMiddleware,
  accessTokenMiddleware
} from '../middlewares/auth_middleware.js'

const router = Router()

router.get(
  '/list',
  accessTokenMiddleware,
  authenticateMiddleware,
  validateListMessages,
  listMessagesController
)

export default router
