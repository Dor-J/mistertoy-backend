import { loggerService } from '../services/logger.service.js'

export async function log(req, res, next) {
  //loggerService.info('Req was made', req.route.path)
  const { baseUrl, method, body, route, params } = req
  loggerService.info(baseUrl, method, body, route.path, params)
  next()
}
