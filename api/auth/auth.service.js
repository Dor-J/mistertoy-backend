import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'

// const users = utilService.readJsonFile('data/user.json')

import { userService } from '../user/user.service.js'
import { loggerService } from '../../services/logger.service.js'

export const authService = {
  signup,
  login,
  getLoginToken,
  validateToken,
}

const cryptr = new Cryptr(process.env.SECRET1 || 'secret-puk-1234')

async function login(username, password) {
  loggerService.debug(`auth.service - login with username: ${username}`)

  let user
  try {
    user = await userService.getByUsername(username)
  } catch (err) {
    throw new Error('Invalid username or password')
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) throw new Error('Invalid username or password')

  delete user.password
  return user
}

async function signup(username, password, fullname) {
  loggerService.debug(
    `auth.service - signup with username: ${username}, fullname: ${fullname}`
  )
  if (!username || !password || !fullname) throw new Error('Missing details')

  let existUser = null
  try {
    existUser = await userService.getByUsername(username)
  } catch (err) {
    if (err.message !== 'User not found by username') throw err
  }
  if (existUser) throw new Error('Username taken')

  const saltRounds = 10
  const hash = await bcrypt.hash(password, saltRounds)
  return userService.add({ username, password: hash, fullname })
}

function getLoginToken(user) {
  const userInfo = {
    _id: user._id,
    fullname: user.fullname,
    isAdmin: user.isAdmin || false,
  }
  return cryptr.encrypt(JSON.stringify(userInfo))
}

function validateToken(token) {
  if (!token) return null
  try {
    const str = cryptr.decrypt(token)
    const user = JSON.parse(str)
    return user
  } catch (err) {
    console.error('Invalid login token')
  }
  return null
}
