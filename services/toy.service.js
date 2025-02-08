import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

export const toyService = {
  query,
  getById,
  remove,
  save,
}

const PAGE_SIZE = 4
const toys = utilService.readJsonFile('data/toy.json')

function query(filterBy) {
  if (!filterBy) return Promise.resolve(toys)
  let filteredToys = toys
  const { name, minPrice, inStock, label, sortBy, orderBy } = filterBy

  if (name) {
    const regExp = new RegExp(name, 'i')
    filteredToys = filteredToys.filter((toy) => regExp.test(toy.name))
  }

  if (label) {
    const regExpLabel = new RegExp(label, 'i')
    filteredToys = filteredToys.filter((toy) => {
      if (!toy.labels || !Array.isArray(toy.labels) || toy.labels.length === 0)
        return false
      else return toy.labels.some((currLabel) => regExpLabel.test(currLabel))
    })
  }

  if (minPrice) {
    filteredToys = filteredToys.filter((toy) => toy.price >= minPrice)
  }

  const isInStock =
    inStock === 'true' ? true : inStock === 'false' ? false : null
  if (isInStock !== null) {
    filteredToys = filteredToys.filter((toy) => toy.inStock === isInStock)
  }

  if (sortBy) {
    // sortBy: name / price / createdAt
    const sortOrder = orderBy === 'asc' ? 1 : -1

    if (sortBy === 'name') {
      filteredToys = filteredToys.sort(
        (a, b) => a.name.localeCompare(b.name) * sortOrder
      )
    } else if (sortBy === 'price') {
      filteredToys = filteredToys.sort(
        (a, b) => (a.price - b.price) * sortOrder
      )
    } else if (sortBy === 'createdAt') {
      filteredToys = filteredToys.sort(
        (a, b) => (a.createdAt - b.createdAt) * sortOrder
      )
    }
  }

  const filteredToysLength = filteredToys.length

  if (filterBy.pageIdx !== undefined) {
    const startIdx = filterBy.pageIdx * PAGE_SIZE
    filteredToys = filteredToys.slice(startIdx, startIdx + PAGE_SIZE)
  }

  return Promise.resolve(getMaxPage(filteredToysLength)).then((maxPage) => {
    return { toys: filteredToys, maxPage }
  })
}

function getById(toyId) {
  const toy = toys.find((toy) => toy._id === toyId)

  if (!toy) return Promise.reject(`Toy not found`)

  // add next/prev ids
  _setNextPrevToyId(toy)

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

function _setNextPrevToyId(toy) {
  const toyIdx = toys.findIndex((currToy) => currToy._id === toy._id)
  if (toyIdx < 0) return

  const nextIdx = (toyIdx + 1) % toys.length
  const prevIdx = (toyIdx - 1 + toys.length) % toys.length

  toy.nextToyId = toys[nextIdx]._id
  toy.prevToyId = toys[prevIdx]._id
}

function getMaxPage(filteredToysLength) {
  if (filteredToysLength) {
    return Promise.resolve(Math.ceil(filteredToysLength / PAGE_SIZE))
  }
  return Promise.resolve(Math.ceil(toys.length / PAGE_SIZE))
}
