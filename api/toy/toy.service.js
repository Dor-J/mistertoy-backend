import { utilService } from '../../services/util.service.js'
import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'
import { ObjectId } from 'mongodb'
import { PAGE_SIZE } from '../../config/index'

export const toyService = {
  query,
  getById,
  remove,
  add,
  update,
  addToyMsg,
  removeToyMsg,
}

const toys = utilService.readJsonFile('data/toy.json')

async function query(filterBy) {
  if (!filterBy) return Promise.resolve(toys)
  const criteria = _buildCriteria(filterBy)
  const criteriaSort = _buildSortCriteria(filterBy)

  try {
    const collection = await dbService.getCollection('toy')
    var filteredToys = await collection
      .find(criteria)
      .sort(criteriaSort)
      .toArray()
  } catch (err) {
    console.log('ERROR: cannot find toys')
    throw err
  }

  const filteredToysLength = filteredToys.length

  if (filterBy.pageIdx !== undefined) {
    const maxPages = Math.max(1, Math.ceil(filteredToysLength / PAGE_SIZE))
    filterBy.pageIdx = Math.min(filterBy.pageIdx, maxPages - 1)
    filterBy.pageIdx = Math.max(filterBy.pageIdx, 0)

    const startIdx = filterBy.pageIdx * PAGE_SIZE
    filteredToys = filteredToys.slice(startIdx, startIdx + PAGE_SIZE)
  }

  const maxPage = await getMaxPage(filteredToysLength)
  return { toys: filteredToys, maxPage }
}

//  function getById(toyId) {
//   const toy = toys.find((toy) => toy._id === toyId)

//   if (!toy) return Promise.reject(`Toy not found`)

//   // add next/prev ids
//   _setNextPrevToyId(toy)

//   return Promise.resolve(toy)
// }

async function getById(toyId) {
  try {
    const collection = await dbService.getCollection('toy')
    const toy = await collection.findOne({
      _id: ObjectId.createFromHexString(toyId),
    })
    if (!toy) throw new Error(`Toy ${toyId} not found`)

    toy.createdAt = toy.getTimestamp()

    return toy
  } catch (err) {
    logger.error(`Error finding toy ${toyId}`, err)
    throw err
  }
}

async function remove(toyId) {
  try {
    const collection = await dbService.getCollection('toy')
    const { deletedCount } = await collection.deleteOne({
      _id: ObjectId.createFromHexString(toyId),
    })
    return deletedCount
  } catch (err) {
    logger.error(`cannot remove toy ${toyId}`, err)
    throw err
  }
}

async function add(toy) {
  try {
    const collection = await dbService.getCollection('toy')
    await collection.insertOne(toy)
    return toy
  } catch (err) {
    logger.error('cannot insert toy', err)
    throw err
  }
}

async function update(toy) {
  try {
    const toyToSave = {
      name: req.body.name,
      price: +req.body.price,
      inStock: req.body.inStock,
      labels: req.body.labels,
      createdAt: +req.body.createdAt,
      updatedAt: Date.now(),
    }
    const collection = await dbService.getCollection('toy')
    await collection.updateOne(
      { _id: ObjectId.createFromHexString(toy._id) },
      { $set: toyToSave }
    )
    return toy
  } catch (err) {
    logger.error(`cannot update toy ${toy._id}`, err)
    throw err
  }
}

async function addToyMsg(toyId, msg) {
  try {
    msg.id = utilService.makeId()
    msg.createdAt = Date.now()

    const collection = await dbService.getCollection('toy')
    await collection.updateOne(
      { _id: ObjectId.createFromHexString(toyId) },
      { $push: { msgs: msg } }
    )
    return msg
  } catch (err) {
    logger.error(`cannot add toy msg ${toyId}`, err)
    throw err
  }
}

async function removeToyMsg(toyId, msgId) {
  try {
    const collection = await dbService.getCollection('toy')
    await collection.updateOne(
      { _id: ObjectId.createFromHexString(toyId) },
      { $pull: { msgs: { id: msgId } } }
    )
    return msgId
  } catch (err) {
    logger.error(`cannot remove toy msg ${toyId}`, err)
    throw err
  }
}

function _setNextPrevToyId(toy) {
  const toyIdx = toys.findIndex((currToy) => currToy._id === toy._id)
  if (toyIdx < 0) return

  const nextIdx = (toyIdx + 1) % toys.length
  const prevIdx = (toyIdx - 1 + toys.length) % toys.length

  toy.nextToyId = toys[nextIdx]._id
  toy.prevToyId = toys[prevIdx]._id
}

async function getMaxPage(filteredToysLength) {
  return Math.max(1, Math.ceil(filteredToysLength / PAGE_SIZE))
}

function _buildCriteria(filterBy) {
  const { name, minPrice, inStock, label } = filterBy
  const criteria = {}

  if (name) {
    criteria.name = { $regex: name, $options: 'i' }
  }
  if (minPrice) {
    criteria.price = { $gte: parseFloat(minPrice) }
  }

  const isInStock =
    inStock === 'true' ? true : inStock === 'false' ? false : null
  if (isInStock !== null) {
    criteria.inStock = isInStock
  }

  if (label) {
    // $in used to search in arrays
    criteria.labels = { $in: [new RegExp(label, 'i')] }
  }

  return criteria
}

function _buildSortCriteria(filterBy) {
  const { sortBy = 'name', orderBy } = filterBy
  const criteriaSort = {}

  if (sortBy) {
    const sortOrder = orderBy === 'asc' ? 1 : -1
    criteriaSort[sortBy] = sortOrder
  }

  return criteriaSort
}
