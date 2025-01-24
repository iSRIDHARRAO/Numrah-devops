import { Router } from 'express'
import {
  authenticateMiddleware,
  accessTokenMiddleware
} from '../middlewares/auth_middleware.js'
import { createMediaController } from '../controllers/media_controllers.js'
import {
  upload,
  handleFileSizeLimit,
  handleFileFormatError
} from '../shared/upload.js'

const router = Router()

router.post(
  '/upload',
  accessTokenMiddleware,
  authenticateMiddleware,
  upload.single('media'),
  handleFileSizeLimit,
  handleFileFormatError,
  createMediaController
)

export default router
