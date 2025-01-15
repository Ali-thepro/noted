const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const authRouter = require('./routes/authRouter')
const userRouter = require('./routes/userRouter')
const imageRouter = require('./routes/imageRouter')
const noteRouter = require('./routes/noteRouter')


mongoose.set('strictQuery', false)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch(error => {
    logger.error('error connecting to MongoDB:', error.message)
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
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(middleware.tokenExtractor)

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/image', imageRouter)
app.use('/api/note', noteRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)
app.use(middleware.customErrorHandler)


module.exports = app
