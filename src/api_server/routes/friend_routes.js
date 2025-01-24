import { Router } from 'express'
import { listFriendsController } from '../controllers/friend_controllers.js'
import { validateListFriends } from '../validators/friend_validator.js'
import {
  authenticateMiddleware,
  accessTokenMiddleware
} from '../middlewares/auth_middleware.js'

const router = Router()

router.get(
  '/list',
  accessTokenMiddleware,
  authenticateMiddleware,
  validateListFriends,
  listFriendsController
)

export default router
