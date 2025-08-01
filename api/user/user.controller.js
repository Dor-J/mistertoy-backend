import { userService } from './user.service.js'
import { loggerService } from '../../services/logger.service.js'

export async function getUser(req, res) {
  try {
    const userId = req.params.id
    const user = await userService.getById(userId)
    res.send(user)
  } catch (err) {
    loggerService.error('Failed to get user', err)
    res.status(500).send({ err: 'Failed to get user' })
  }
}

export async function getUsers(req, res) {
  try {
    const filterBy = {
      searchCriteria: req.query?.searchCriteria || '',
      minScore: +req.query?.minScore || 0,
    }
    const users = await userService.query(filterBy)

    res.send(users)
  } catch (err) {
    loggerService.error('Failed to get users', err)
    res.status(500).send({ err: 'Failed to get users' })
  }
}

export async function deleteUser(req, res) {
  try {
    await userService.remove(req.params.id)
    res.send({ msg: 'Deleted successfully' })
  } catch (err) {
    loggerService.error('Failed to delete user', err)
    res.status(500).send({ err: 'Failed to delete user' })
  }
}

export async function updateUser(req, res) {
  try {
    const userId = req.params.id
    const diff = req.body.diff
    const user = await userService.getById(userId)

    if (!user) return res.status(404).send({ err: 'User not found' })

    user.score = (user.score || 0) + diff
    user._id = userId

    const savedUser = await userService.update(user)
    res.send(savedUser)
  } catch (err) {
    loggerService.error('Failed to update user', err)
    res.status(500).send({ err: 'Failed to update user' })
  }
}

// Lean version
// export async function updateUser(req, res) {
//   try {
//       const user = req.body
//       const savedUser = await userService.update(user)
//       res.send(savedUser)
//   } catch (err) {
//       logger.error('Failed to update user', err)
//       res.status(400).send({ err: 'Failed to update user' })
//   }
// }
