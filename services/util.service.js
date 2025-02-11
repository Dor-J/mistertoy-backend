import fs from 'fs'
import fr from 'follow-redirects'

const { http, https } = fr

export const utilService = {
  readJsonFile,
  download,
  httpGet,
  makeId,
  debounce,
  getRandomInt,
  generateRandomName,
  timeAgo,
  randomPastTime,
}

function readJsonFile(path) {
  const str = fs.readFileSync(path, 'utf8')
  const json = JSON.parse(str)
  return json
}

function download(url, fileName) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(fileName)
    const protocol = url.startsWith('https') ? https : http

    protocol.get(url, (content) => {
      content.pipe(file)
      file.on('error', reject)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    })
  })
}

function httpGet(url) {
  const protocol = url.startsWith('https') ? https : http
  const options = {
    method: 'GET',
  }

  return new Promise((resolve, reject) => {
    const req = protocol.request(url, options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        resolve(data)
      })
    })
    req.on('error', (err) => {
      reject(err)
    })
    req.end()
  })
}

function makeId(length = 5) {
  let text = ''
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

function debounce(func, timeout = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, timeout)
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateRandomName() {
  const names = [
    'Jhon',
    'Wick',
    'Strong',
    'Dude',
    'Yep',
    'Hello',
    'World',
    'Power',
    'Goku',
    'Super',
    'Hi',
    'You',
    'Are',
    'Awesome',
  ]
  const famName = [
    'star',
    'kamikaza',
    'family',
    'eat',
    'some',
    'banana',
    'brock',
    'david',
    'gun',
    'walk',
    'talk',
    'car',
    'wing',
    'yang',
    'snow',
    'fire',
  ]
  return (
    names[Math.floor(Math.random() * names.length)] +
    famName[Math.floor(Math.random() * names.length)]
  )
}

function timeAgo(ms = new Date()) {
  const date = ms instanceof Date ? ms : new Date(ms)
  const formatter = new Intl.RelativeTimeFormat('en')
  const ranges = {
    years: 3600 * 24 * 365,
    months: 3600 * 24 * 30,
    weeks: 3600 * 24 * 7,
    days: 3600 * 24,
    hours: 3600,
    minutes: 60,
    seconds: 1,
  }
  const secondsElapsed = (date.getTime() - Date.now()) / 1000
  for (let key in ranges) {
    if (ranges[key] < Math.abs(secondsElapsed)) {
      const delta = secondsElapsed / ranges[key]
      let time = formatter.format(Math.round(delta), key)
      if (time.includes('in')) {
        time = time.replace('in ', '')
        time = time.replace('ago', '')
        time += ' ago'
      }
      return time //? time : 'Just now'
    }
  }
}

function randomPastTime() {
  const HOUR = 1000 * 60 * 60
  const DAY = 1000 * 60 * 60 * 24
  const WEEK = 1000 * 60 * 60 * 24 * 7

  const pastTime = getRandomIntInclusive(HOUR, WEEK)
  return Date.now() - pastTime
}
