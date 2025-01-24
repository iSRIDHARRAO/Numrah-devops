import logger from '../shared/logger.js'

export default function loggerMiddleware(req, res, next) {
  logger.info({ route: req.path, method: req.method }, 'Request received')
  next()
}
