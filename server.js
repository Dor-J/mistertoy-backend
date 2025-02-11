import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
import path, { dirname } from 'path'
import http from 'http'
import { fileURLToPath } from 'url'

import { loggerService } from './services/logger.service.js'
import { setupSocketAPI } from './services/socket.service.js'

//import { toyService } from './services/toy.service.js'
//import { userService } from './services/user.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const server = http.createServer(app)

// Express Config:
if (process.env.NODE_ENV === 'production') {
  // Express serve static files on production environment
  app.use(express.static(path.resolve(__dirname, 'public')))
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

// No cors method: app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

// Express Routing:
import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { toyRoutes } from './api/toy/toy.routes.js'
import { statsRoutes } from './api/stats/stats.routes.js'
import { reviewRoutes } from './api/review/review.routes.js'
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'

// routes

app.all('*', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/toy', toyRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/review', reviewRoutes)

setupSocketAPI(server)

// Fallback route
app.get('/**', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

const port = process.env.PORT || 3030
app.listen(port, () =>
  loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
)
