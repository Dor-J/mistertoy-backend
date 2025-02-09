import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { loggerService } from './services/logger.service.js'

//import { toyService } from './services/toy.service.js'
//import { userService } from './services/user.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

// Express Config:
if (process.env.NODE_ENV === 'production') {
  // Express serve static files on production environment
  app.use(express.static(path.resolve(__dirname, 'public')))
  console.log('__dirname: ', __dirname)
} else {
  const corsOptions = {
    origin: [
      'http://127.0.0.1:8080',
      'http://localhost:8080',
      'http://127.0.0.1:5173',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://localhost:3000',
    ],
    credentials: true,
  }

  app.use(cors(corsOptions))
}

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

// Express Routing:
import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { toyRoutes } from './api/toy/toy.routes.js'

// routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/toy', toyRoutes)

// REST API for Toys
// app.get('/api/toy', (req, res) => {
//   const filterBy = {
//     name: req.query.name || '',
//     minPrice: +req.query.minPrice || 0,
//     inStock: req.query.inStock || '',
//     label: req.query.label || [],
//     sortBy: req.query.sortBy || '',
//     orderBy: req.query.orderBy || '',
//     pageIdx: +req.query.pageIdx || 0,
//   }
//   toyService
//     .query(filterBy)
//     .then((toys) => res.send(toys))
//     .catch((err) => {
//       loggerService.error('Cannot get toys', err)
//       res.status(400).send('Cannot get toys')
//     })
// })

// app.get('/api/alltoys', (req, res) => {
//   const loggedInUser = userService.validateToken(req.cookies.loginToken)
//   if (!loggedInUser) {
//     return res.status(401).send('Not logged in yet')
//   }

//   toyService
//     .query()
//     .then((toys) => res.send(toys))
//     .catch((err) => {
//       loggerService.error('Cannot get all toys', err)
//       res.status(400).send('Cannot get all toys')
//     })
// })

// app.get('/api/toy/:toyId', (req, res) => {
//   const { toyId } = req.params

//   toyService
//     .getById(toyId)
//     .then((toy) => res.send(toy))
//     .catch((err) => {
//       loggerService.error('Cannot get toy', err)
//       res.status(400).send('Cannot get toy')
//     })
// })

// app.post('/api/toy', (req, res) => {
//   //return res.status(404).send('NOT FOUND')

//   const loggedInUser = userService.validateToken(req.cookies.loginToken)
//   // ensure logged in and isAdmin
//   if (!loggedInUser || !loggedInUser.isAdmin) {
//     return res.status(403).send('Not authorized')
//   }

//   const toy = {
//     name: req.body.name,
//     price: +req.body.price,
//     inStock: req.body.inStock,
//     labels: req.body.labels,
//     createdAt: +req.body.createdAt,
//     updatedAt: +req.body.updatedAt,
//   }
//   toyService
//     .save(toy)
//     .then((savedToy) => res.send(savedToy))
//     .catch((err) => {
//       loggerService.error('Cannot save toy', err)
//       res.status(400).send('Cannot save toy')
//     })
// })

// app.put('/api/toy/:id', (req, res) => {
//   const loggedInUser = userService.validateToken(req.cookies.loginToken)
//   if (!loggedInUser || !loggedInUser.isAdmin) {
//     return res.status(403).send('Not authorized')
//   }

//   const { id } = req.params
//   const toy = {
//     _id: id,
//     name: req.body.name,
//     price: +req.body.price,
//     inStock: req.body.inStock,
//     labels: req.body.labels,
//     createdAt: +req.body.createdAt,
//     updatedAt: Date.now(),
//   }
//   toyService
//     .save(toy)
//     .then((savedToy) => res.send(savedToy))
//     .catch((err) => {
//       loggerService.error('Cannot save toy', err)
//       res.status(400).send('Cannot save toy')
//     })
// })

// app.delete('/api/toy/:toyId', (req, res) => {
//   const loggedInUser = userService.validateToken(req.cookies.loginToken)
//   if (!loggedInUser || !loggedInUser.isAdmin) {
//     return res.status(403).send('Not authorized')
//   }

//   const { toyId } = req.params
//   toyService
//     .remove(toyId)
//     .then(() => res.send('Removed succesfully!'))
//     .catch((err) => {
//       loggerService.error('Cannot remove toy', err)
//       res.status(400).send('Cannot remove toy')
//     })
// })

// User API
// app.get('/api/user', (req, res) => {
//   const loggedInUser = userService.validateToken(req.cookies.loginToken)
//   if (!loggedInUser || !loggedInUser.isAdmin) {
//     return res.status(403).send('Not authorized')
//   }

//   userService
//     .query()
//     .then((users) => res.send(users))
//     .catch((err) => {
//       loggerService.error('Cannot load users', err)
//       res.status(400).send('Cannot load users')
//     })
// })

// app.get('/api/user/:userId', (req, res) => {
//   const { userId } = req.params

//   userService
//     .getById(userId)
//     .then((user) => res.send(user))
//     .catch((err) => {
//       loggerService.error('Cannot load user', err)
//       res.status(400).send('Cannot load user')
//     })
//})

// app.put('/api/user', (req, res) => {
//   const loggedInUser = userService.validateToken(req.cookies.loginToken)
//   if (!loggedInUser) return res.status(400).send('No logged in user')
//   const { diff } = req.body
//   if (loggedInUser.score + diff < 0) return res.status(400).send('No credit')
//   loggedInUser.score += diff
//   return userService
//     .save(loggedInUser)
//     .then((user) => {
//       const token = userService.getLoginToken(user)
//       res.cookie('loginToken', token)
//       res.send(user)
//     })
//     .catch((err) => {
//       loggerService.error('Cannot edit user', err)
//       res.status(400).send('Cannot edit user')
//     })
// })

// Auth API
// app.post('/api/auth/login', (req, res) => {
//   const credentials = req.body

//   userService
//     .checkLogin(credentials)
//     .then((user) => {
//       if (user) {
//         const loginToken = userService.getLoginToken(user)
//         res.cookie('loginToken', loginToken)
//         res.send(user)
//       } else {
//         res.status(401).send('Invalid Credentials')
//       }
//     })
//     .catch((err) => {
//       loggerService.error('Cannot login', err)
//       res.status(400).send('Cannot login')
//     })
// })

// app.post('/api/auth/signup', (req, res) => {
//   const credentials = req.body

//   userService
//     .save(credentials)
//     .then((user) => {
//       if (user) {
//         const loginToken = userService.getLoginToken(user)
//         res.cookie('loginToken', loginToken)
//         res.send(user)
//       } else {
//         res.status(400).send('Cannot signup')
//       }
//     })
//     .catch((err) => {
//       loggerService.error('Cannot signup', err)
//       res.status(400).send('Cannot signup')
//     })
// })

// app.post('/api/auth/logout', (req, res) => {
//   res.clearCookie('loginToken')
//   res.send('logged-out!')
// })

// Fallback route
app.get('/**', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

const port = process.env.PORT || 3030
app.listen(port, () =>
  loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
)
