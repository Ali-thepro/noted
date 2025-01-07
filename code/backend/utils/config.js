require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI
const PORT = process.env.PORT
const UI_URI = process.env.UI_URI
const SERVER_URI = process.env.SERVER_URI

module.exports = {
  MONGODB_URI,
  PORT,
  UI_URI,
  SERVER_URI
}