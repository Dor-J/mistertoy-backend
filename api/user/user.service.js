import { utilService } from '../../services/util.service.js'
import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'

import { ObjectId } from 'mongodb'

//const users = utilService.readJsonFile('data/user.json')

export const userService = {
  add, // Create (Signup)
  getById, // Read (Profile page)
  update, // Update (Edit profile)
  remove, // Delete (remove user)
  query, // List (of users)
  getByUsername, // Used for Login
}

// function query() {
//   const usersToReturn = users.map((user) => ({
//     _id: user._id,
//     fullname: user.fullname,
//   }))
//   return Promise.resolve(usersToReturn)
// }
async function query(filterBy = {}) {
  const criteria = _buildCriteria(filterBy)
  try {
    const collection = await dbService.getCollection('user')

    var users = await collection.find(criteria).sort({ fullname: -1 }).toArray()
    users = users.map((user) => {
      delete user.password
      return user
    })

    return users
  } catch (err) {
    loggerService.error('No users found', err)
    throw err
  }
}

// function getById(userId) {
//   var user = users.find((user) => user._id === userId)
//   if (!user) return Promise.reject('User not found!')

//   user = {
//     _id: user._id,
//     username: user.username,
//     fullname: user.fullname,
//     score: user.score,
//     isAdmin: user.isAdmin || false,
//   }

//   return Promise.resolve(user)
// }

async function getById(userId) {
  try {
    let criteria = { _id: ObjectId.createFromHexString(userId) }

    const collection = await dbService.getCollection('user')

    const user = await collection.findOne(criteria)
    delete user.password

    criteria = { byUserId: userId }

    user.givenReviews = await reviewService.query(criteria)
    user.givenReviews = user.givenReviews.map((review) => {
      delete review.byUser
      return review
    })

    return user
  } catch (err) {
    loggerService.error(`Error finding user by ID: ${userId}`, err)
    throw err
  }
}

async function getByUsername(username) {
  try {
    const collection = await dbService.getCollection('user')

    const user = await collection.findOne({ username })
    if (!user) throw new Error('User not found by username')

    //delete user.password <--------BUG, DONT DELETE PASSWORD BECAUSE ITS FOR COMPARISON
    return user
  } catch (err) {
    loggerService.error(`Error finding user by username: ${username}`, err)
    throw err
  }
}

// function remove(userId) {
//   //users = users.filter(user => user._id !== userId)
//   const idx = users.findIndex((user) => user._id === userId)
//   if (idx !== -1) users.splice(idx, 1)
//   return _saveUsersToFile()
// }
async function remove(userId) {
  try {
    const criteria = { _id: ObjectId.createFromHexString(userId) }

    const collection = await dbService.getCollection('user')

    await collection.deleteOne(criteria)
  } catch (err) {
    loggerService.error(`Error cannot remove user with id: ${userId}`, err)
    throw err
  }
}

async function update(user) {
  try {
    // peek only updatable fields!
    const userToSave = {
      _id: ObjectId.createFromHexString(user._id),
      username: user.username,
      fullname: user.fullname,
      score: user.score,
      isAdmin: user.isAdmin || false,
      createdAt: user.createdAt,
      updatedAt: Date.now(),
    }

    const collection = await dbService.getCollection('user')

    await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })

    return userToSave
  } catch (err) {
    loggerService.error(`cannot update user ${user._id}`, err)
    throw err
  }
}

async function add(user) {
  try {
    // Validate that there are no such user:
    const existUser = await getByUsername(user.username)
    if (existUser) throw new Error('Username taken')

    // peek only updatable fields!
    const userToAdd = {
      username: user.username,
      password: user.password,
      fullname: user.fullname,
      score: user.score || 1000,
      isAdmin: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const collection = await dbService.getCollection('user')
    const result = await collection.insertOne(userToAdd)
    userToAdd._id = result.insertedId

    return userToAdd
  } catch (err) {
    loggerService.error('cannot insert user', err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = {}
  if (filterBy.searchCriteria) {
    const txtCriteria = { $regex: filterBy.searchCriteria, $options: 'i' }
    criteria.$or = [
      {
        username: txtCriteria,
      },
      {
        fullname: txtCriteria,
      },
    ]
  }
  if (filterBy.minScore) {
    criteria.score = { $gte: filterBy.minScore }
  }

  return criteria
}
