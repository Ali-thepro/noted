const jwt = require('jsonwebtoken')
const createError = require('./error')
const User = require('../models/user')
const config = require('../utils/config')

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.code === 11000) {
    if (error.keyPattern && error.keyPattern.username) {
      return response.status(400).json({ error: 'expected username to be unique' })
    }
    return response.status(400).json({ error: 'Duplicate key error' })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'token missing or invalid' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired - please re-authenticate' })
  }

  next(error)
}

const customErrorHandler = (error, request, response, next) => {
  const statusCode = error.statusCode || 500
  const message = error.message || 'Internal Server Error'
  response.status(statusCode).json({
    error: message
  })

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    request.token = authorization.replace('Bearer ', '')
  } else if (request.cookies.accessToken) {
    request.token = request.cookies.accessToken
  } else {
    request.token = null
  }
  next()
}

const verifyUser = async (request, response, next) => {
  try {
    let token = request.token

    if (!token) {
      return next(createError('Unauthorised - No token, please re-authenticate', 401))
    }

    const decodedToken = jwt.verify(token, config.ACCESS_SECRET)
    if (!decodedToken.id) {
      return next(createError('Unauthorised - Invalid token', 401))
    }

    const user = await User.findById(decodedToken.id)
    if (!user) {
      return next(createError('Unauthorised - User not found', 401))
    }

    request.user = user
    next()
  } catch (error) {
    console.error('Token verification error:', error)
    return next(createError('Unauthorised - Token verification failed', 401))
  }
}

module.exports = {
  errorHandler,
  customErrorHandler,
  unknownEndpoint,
  verifyUser,
  tokenExtractor
}
