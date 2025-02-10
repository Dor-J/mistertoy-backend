import { utilService } from '../../services/util.service.js'
import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'
import { ObjectId } from 'mongodb'
import { PAGE_SIZE } from '../../config/index.js'

export const toyService = {
  query,
  queryAll,
  getById,
  remove,
  add,
  update,
  addToyMsg,
  removeToyMsg,
}

//const toys = utilService.readJsonFile('data/toy.json')

async function query(filterBy = {}) {
  if (!filterBy) {
    ;(err) => {
      console.error('ERROR: cannot use filterBy toys', err)
      throw err
    }
  }
  const criteria = _buildCriteria(filterBy)
  const criteriaSort = _buildSortCriteria(filterBy)

  try {
    const collection = await dbService.getCollection('toy')
    var filteredToys = await collection
      .find(criteria)
      .sort(criteriaSort)
      .toArray()
  } catch (err) {
    console.error('ERROR: cannot find toys')
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

async function queryAll() {
  try {
    const collection = await dbService.getCollection('toy')
    const allToys = await collection.find({}).toArray()
    return allToys
  } catch (err) {
    console.error('ERROR: cannot find ALL toys')
    throw err
  }
}

async function getById(toyId) {
  try {
    const collection = await dbService.getCollection('toy')
    const toy = await collection.findOne({
      _id: ObjectId.createFromHexString(toyId),
    })
    if (!toy) throw new Error(`Toy ${toyId} not found`)

    toy.createdAt = toy._id.getTimestamp()

    //   // add next/prev ids
    //   _setNextPrevToyId(toy)

    return toy
  } catch (err) {
    loggerService.error(`Error finding toy ${toyId}`, err)
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
    loggerService.error(`cannot remove toy ${toyId}`, err)
    throw err
  }
}

async function add(toy) {
  try {
    const collection = await dbService.getCollection('toy')
    await collection.insertOne(toy)
    return toy
  } catch (err) {
    loggerService.error('cannot insert toy', err)
    throw err
  }
}

async function update(toy) {
  try {
    const toyToSave = {
      name: toy.name,
      price: toy.price,
      inStock: toy.inStock,
      labels: toy.labels,
      msgs: toy.msgs,
      createdAt: toy.createdAt,
      updatedAt: Date.now(),
    }
    const collection = await dbService.getCollection('toy')
    await collection.updateOne(
      { _id: ObjectId.createFromHexString(toy._id) },
      { $set: toyToSave }
    )
    return toy
  } catch (err) {
    loggerService.error(`cannot update toy ${toy._id}`, err)
    throw err
  }
}

async function addToyMsg(toyId, msg) {
  try {
    msg.id = utilService.makeId(6)
    msg.createdAt = Date.now()

    const collection = await dbService.getCollection('toy')
    await collection.updateOne(
      { _id: ObjectId.createFromHexString(toyId) },
      { $push: { msgs: msg } }
    )
    return msg
  } catch (err) {
    loggerService.error(`cannot add toy msg ${toyId}`, err)
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
    loggerService.error(`cannot remove toy msg ${toyId}`, err)
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
    criteria.price = { $gte: minPrice }
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

// function _buildCriteria(filterBy) {
//   const filterCriteria = {}
//   if (filterBy.txt) {
//     filterCriteria.name = { $regex: filterBy.txt, $options: 'i' }
//   }
//   if (filterBy.inStock) {
//     filterCriteria.inStock = JSON.parse(filterBy.inStock)
//   }
//   if (filterBy.labels && filterBy.labels.length) {
//     filterCriteria.labels = { $all: filterBy.labels }
//   }
//   const sortCriteria = {}
//   const sortBy = filterBy.sortBy
//   if (sortBy.type) {
//     const sortDirection = +sortBy.sortDir
//     sortCriteria[sortBy.type] = sortDirection
//   } else sortCriteria.createdAt = -1
//   const skip = filterBy.pageIdx !== undefined ? filterBy.pageIdx * PAGE_SIZE : 0
//   return { filterCriteria, sortCriteria, skip }
// }
