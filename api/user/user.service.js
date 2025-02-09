import fs from 'fs'
import Cryptr from 'cryptr'

import { utilService } from '../../services/util.service.js'

const cryptr = new Cryptr(process.env.SECRET1 || 'secret-puk-1234')
const users = utilService.readJsonFile('data/user.json')

export const userService = {
  query,
  getById,
  remove,
  save,
}

function query() {
  const usersToReturn = users.map((user) => ({
    _id: user._id,
    fullname: user.fullname,
  }))
  return Promise.resolve(usersToReturn)
}

function getById(userId) {
  var user = users.find((user) => user._id === userId)
  if (!user) return Promise.reject('User not found!')

  user = {
    _id: user._id,
    username: user.username,
    fullname: user.fullname,
    score: user.score,
    isAdmin: user.isAdmin || false,
  }

  return Promise.resolve(user)
}

function remove(userId) {
  //users = users.filter(user => user._id !== userId)
  const idx = users.findIndex((user) => user._id === userId)
  if (idx !== -1) users.splice(idx, 1)
  return _saveUsersToFile()
}

function save(user) {
  let userToUpdate = user
  if (user._id) {
    userToUpdate = users.find((_user) => user._id === _user._id)
    userToUpdate.score = user.score
    userToUpdate.isAdmin = user.isAdmin
  } else {
    userToUpdate._id = utilService.makeId(7)
    users.push(userToUpdate)
  }
  const miniUser = {
    _id: userToUpdate._id,
    fullname: userToUpdate.fullname,
    score: userToUpdate.score,
    isAdmin: user.isAdmin,
  }
  return _saveUsersToFile().then(() => miniUser)
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
