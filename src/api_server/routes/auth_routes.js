import { Router } from 'express'
import {
  registerController,
  loginController,
  refreshController,
  logoutController
} from '../controllers/auth_controllers.js'
import {
  validateRegistration,
  validateLogin
} from '../validators/auth_validators.js'

const router = Router()

router.post('/register', validateRegistration, registerController)
router.post('/login', validateLogin, loginController)
router.post('/refresh', refreshController)
router.delete('/logout', logoutController)

export default router
