import fs from 'fs'
import Cryptr from 'cryptr'

import { utilService } from './util.service.js'

const cryptr = new Cryptr(process.env.SECRET1 || 'secret-puk-1234')
const users = utilService.readJsonFile('data/user.json')

export const userService = {
  checkLogin,
  getLoginToken,
  validateToken,
}

function checkLogin({ username, password }) {
  // You might want to remove the password validation for dev
  var user = users.find(
    (user) => user.username === username && user.password === password
  )

  if (user) {
    user = {
      _id: user._id,
      fullname: user.fullname,
      isAdmin: user.isAdmin || false,
      score: user.score,
    }
  }
  return Promise.resolve(user)
}

function getLoginToken(user) {
  const str = JSON.stringify(user)
  const encryptedStr = cryptr.encrypt(str)
  return encryptedStr
}

function validateToken(token) {
  if (!token) return null

  const str = cryptr.decrypt(token)
  const user = JSON.parse(str)
  return user
}

function _saveUsersToFile() {
  return new Promise((resolve, reject) => {
    const usersStr = JSON.stringify(users, null, 2)
    fs.writeFile('data/user.json', usersStr, (err) => {
      if (err) {
        return console.error(err)
      }
      resolve()
    })
  })
}
