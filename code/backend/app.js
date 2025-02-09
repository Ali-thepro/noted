const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const config = require('./utils/config')
const middleware = require('./utils/middleware')
const authRouter = require('./routes/authRouter')
const imageRouter = require('./routes/imageRouter')
const noteRouter = require('./routes/noteRouter')
const versionRouter = require('./routes/versionRouter')
const encryptionRouter = require('./routes/encryptionRouter')

mongoose.set('strictQuery', false)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.error('error connecting to MongoDB:', error.message)
  })

morgan.token('body', (req) => JSON.stringify(req.body))

app.use(cors({
  origin: config.UI_URI,
  credentials: true,
  referrerPolicy: 'no-referrer-when-downgrade',
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
}))
app.use(express.json())
app.use(cookieParser())
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
}
app.use(middleware.tokenExtractor)

app.use('/api/auth', authRouter)
app.use('/api/image', imageRouter)
app.use('/api/note', noteRouter)
app.use('/api/version', versionRouter)
app.use('/api/encryption', encryptionRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)
app.use(middleware.customErrorHandler)


module.exports = app
