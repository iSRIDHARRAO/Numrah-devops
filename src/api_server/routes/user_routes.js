import { Router } from 'express'
import {
  userUpdateController,
  userDeleteController
} from '../controllers/user_controllers.js'
import { validateUserUpdate } from '../validators/user_validator.js'
import {
  authenticateMiddleware,
  accessTokenMiddleware
} from '../middlewares/auth_middleware.js'
import {
  upload,
  handleFileSizeLimit,
  handleFileFormatError
} from '../shared/upload.js'

const router = Router()

router.patch(
  '/',
  accessTokenMiddleware,
  authenticateMiddleware,
  upload.single('avatar'),
  handleFileSizeLimit,
  handleFileFormatError,
  validateUserUpdate,
  userUpdateController
)

router.delete(
  '/',
  accessTokenMiddleware,
  authenticateMiddleware,
  userDeleteController
)

export default router
