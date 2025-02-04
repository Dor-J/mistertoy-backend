import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

export const toyService = {
  query,
  getById,
  remove,
  save,
}

//const PAGE_SIZE = 5
const toys = utilService.readJsonFile('data/toy.json')

function query(filterBy) {
  if (!filterBy) return Promise.resolve(toys)
  let toysToReturn = toys
  const { name, minPrice, inStock, label, sortBy, orderBy } = filterBy

  if (name) {
    const regExp = new RegExp(name, 'i')
    toysToReturn = toysToReturn.filter((toy) => regExp.test(toy.name))
  }

  if (label) {
    const regExpLabel = new RegExp(label, 'i')
    toysToReturn = toysToReturn.filter((toy) => {
      if (!toy.labels || !Array.isArray(toy.labels) || toy.labels.length === 0)
        return false
      else return toy.labels.some((currLabel) => regExpLabel.test(currLabel))
    })
  }

  if (minPrice) {
    toysToReturn = toysToReturn.filter((toy) => toy.price >= minPrice)
  }

  const isInStock =
    inStock === 'true' ? true : inStock === 'false' ? false : null
  if (isInStock !== null) {
    toysToReturn = toysToReturn.filter((toy) => toy.inStock === isInStock)
  }

  if (sortBy) {
    // sortBy: name / price / createdAt
    const sortOrder = orderBy === 'asc' ? 1 : -1

    if (sortBy === 'name') {
      toysToReturn = toysToReturn.sort(
        (a, b) => a.name.localeCompare(b.name) * sortOrder
      )
    } else if (sortBy === 'minPrice') {
      toysToReturn = toysToReturn.sort(
        (a, b) => (a.price - b.price) * sortOrder
      )
    } else if (sortBy === 'createdAt') {
      toysToReturn = toysToReturn.sort(
        (a, b) => (a.createdAt - b.createdAt) * sortOrder
      )
    }
  }

  return Promise.resolve(toysToReturn)
}

function getById(toyId) {
  const toy = toys.find((toy) => toy._id === toyId)
  return Promise.resolve(toy)
}

function remove(toyId) {
  const idx = toys.findIndex((toy) => toy._id === toyId)
  if (idx === -1) return Promise.reject('No Such Toy')

  toys.splice(idx, 1)
  return _saveToysToFile()
}

function save(toy) {
  if (toy._id) {
    const toyToUpdate = toys.find((currToy) => currToy._id === toy._id)

    toyToUpdate.name = toy.name
    toyToUpdate.price = toy.price
    toyToUpdate.labels = toy.labels
    toyToUpdate.inStock = toy.inStock
    toy = toyToUpdate
  } else {
    toy._id = utilService.makeId()
    toys.push(toy)
  }
  return _saveToysToFile().then(() => toy)
}

function _saveToysToFile() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(toys, null, 2)
    fs.writeFile('data/toy.json', data, (err) => {
      if (err) {
        loggerService.error('Cannot write to toys file', err)
        return reject(err)
      }
      resolve()
    })
  })
}
