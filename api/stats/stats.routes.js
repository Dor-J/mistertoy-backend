import express from 'express'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { getAllToys } from '../toy/toy.controller.js'
import { log } from '../../middlewares/logger.middleware.js'

export const statsRoutes = express.Router()

statsRoutes.get('/', requireAuth, getAllToys)
