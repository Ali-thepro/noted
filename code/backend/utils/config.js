require('dotenv').config()

// Add debugging logs
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('TEST_MONGODB_URI:', process.env.TEST_MONGODB_URI ? 'Set' : 'Not set')
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set')

const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

// Add another log to see final URI
console.log('Selected MONGODB_URI:', MONGODB_URI)

const PORT = process.env.PORT
const ACCESS_SECRET = process.env.ACCESS_SECRET
const REFRESH_SECRET = process.env.REFRESH_SECRET
const UI_URI = process.env.UI_URI
const SERVER_URI = process.env.SERVER_URI
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME
const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY


module.exports = {
  MONGODB_URI,
  PORT,
  ACCESS_SECRET,
  REFRESH_SECRET,
  UI_URI,
  SERVER_URI,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_REDIRECT_URI,
  AWS_BUCKET_NAME,
  AWS_BUCKET_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_KEY
}
