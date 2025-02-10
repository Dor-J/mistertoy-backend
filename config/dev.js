import 'dotenv/config'
const DB_NAME = process.env.VITE_MONGO_NAME
const DB_CRED = process.env.VITE_MONGO_CRED

export default {
  // dbURL: 'mongodb://127.0.0.1:27017',
  dbURL:
    'mongodb+srv://' +
    DB_NAME +
    ':' +
    DB_CRED +
    '@proj-mister-toy.r6vo5.mongodb.net/?retryWrites=true&w=majority&appName=proj-mister-toy',
  // dbName: 'mister_toy_db',
  dbName: 'mister_toy',
}
