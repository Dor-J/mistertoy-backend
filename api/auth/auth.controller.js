import { authService } from './auth.service.js'
import { loggerService } from '../../services/logger.service.js'

export async function login(req, res) {
  const { username, password } = req.body
  try {
    if (!username || !password) {
      return res.status(400).send({ err: 'Missing credentials' })
    }

    const user = await authService.login(username, password)
    if (user) {
      const loginToken = authService.getLoginToken(user)
      loggerService.info('User login: ', user)
      res.cookie('loginToken', loginToken, {
        // In case of blocking of cookies from browser
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
      })
      res.json(user)
    } else {
      res.status(401).send('Invalid Credentials')
    }
  } catch (err) {
    loggerService.error('Failed to Login ' + err)
    res.status(401).send({ err: 'Failed to Login' })
  }
}

export async function signup(req, res) {
  try {
    const { username, password, fullname } = req.body
    if (!username || !password || !fullname) {
      return res.status(400).send({ err: 'Missing required fields' })
    }

    // IMPORTANT!!!
    // Never write passwords to log file!!!

    const account = await authService.signup(username, password, fullname)
    loggerService.debug(
      `auth.route - new account created: ` + JSON.stringify(account)
    )

    const user = await authService.login(username, password)
    const loginToken = authService.getLoginToken(user)

    res.cookie('loginToken', loginToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
    })

    res.json(user)
  } catch (err) {
    loggerService.error('Failed to signup ' + err)
    res.status(500).send({ err: 'Failed to signup' })
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie('loginToken')
    res.send({ msg: 'Logged out successfully' })
  } catch (err) {
    res.status(500).send({ err: 'Failed to logout' })
  }
}
