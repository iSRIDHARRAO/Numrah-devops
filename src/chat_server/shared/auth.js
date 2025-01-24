import jwt from 'jsonwebtoken'
import config from '../config.js'

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET)
    return decoded
  } catch (error) {
    throw new Error('JWT verification failed')
  }
}
