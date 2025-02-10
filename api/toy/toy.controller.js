import { toyService } from './toy.service.js'
import { loggerService } from '../../services/logger.service.js'

export async function getToys(req, res) {
  try {
    const filterBy = {
      name: req.query.name || '',
      minPrice: +req.query.minPrice || 0,
      inStock: req.query.inStock || '',
      label: req.query.label || '',
      sortBy: req.query.sortBy || '',
      orderBy: req.query.orderBy || '',
      pageIdx: +req.query.pageIdx || 0,
    }
    const toys = await toyService.query(filterBy)
    res.json(toys)
  } catch (err) {
    loggerService.error('Failed to get toys', err)
    res.status(500).send({ err: 'Failed to get toys' })
  }
}

export async function getToyById(req, res) {
  try {
    const toyId = req.params.id
    const toy = await toyService.getById(toyId)
    res.json(toy)
  } catch (err) {
    loggerService.error('Failed to get toy', err)
    res.status(500).send({ err: 'Failed to get toy' })
  }
}

export async function addToy(req, res) {
  //const { loggedinUser } = req

  try {
    const toy = {
      name: req.body.name,
      price: +req.body.price,
      inStock: req.body.inStock,
      labels: req.body.labels,
      createdAt: +req.body.createdAt,
      updatedAt: +req.body.updatedAt,
    }

    const addedToy = await toyService.add(toy)
    res.json(addedToy)
  } catch (err) {
    loggerService.error('Failed to add toy', err)
    res.status(500).send({ err: 'Failed to add toy' })
  }
}

export async function updateToy(req, res) {
  try {
    const toy = { ...req.body, _id: req.params.id, updatedAt: Date.now() }
    const updatedToy = await toyService.update(toy)
    res.json(updatedToy)
  } catch (err) {
    loggerService.error('Failed to update toy', err)
    res.status(500).send({ err: 'Failed to update toy' })
  }
}

export async function removeToy(req, res) {
  try {
    const toyId = req.params.id
    const deletedCount = await toyService.remove(toyId)
    res.json({ msg: `${deletedCount} toys removed` })
  } catch (err) {
    loggerService.error('Failed to remove toy', err)
    res.status(500).send({ err: 'Failed to remove toy' })
  }
}

export async function addToyMsg(req, res) {
  const { loggedinUser } = req
  const { _id, fullname } = loggedinUser
  try {
    const toyId = req.params.id
    const msg = {
      txt: req.body.txt,
      by: {
        _id,
        fullname,
      },
    }
    const savedMsg = await toyService.addToyMsg(toyId, msg)
    res.json(savedMsg)
  } catch (err) {
    loggerService.error('Failed to update toy', err)
    res.status(500).send({ err: 'Failed to update toy' })
  }
}

export async function removeToyMsg(req, res) {
  const { loggedinUser } = req
  try {
    // const toyId = req.params.id
    // const { id: toyId, msgId } = req.params
    const toyId = req.params.id
    const msgId = req.params.msgId

    const removedId = await toyService.removeToyMsg(toyId, msgId)
    res.send(removedId)
  } catch (err) {
    loggerService.error('Failed to remove toy msg', err)
    res.status(500).send({ err: 'Failed to remove toy msg' })
  }
}
