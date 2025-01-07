const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && (error.message.includes('E11000 duplicate key error collection: NoteApp.users index: username'))) {
    return response.status(400).json({ error: 'expected username to be unique' })
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

module.exports = {
  errorHandler,
  customErrorHandler,
  unknownEndpoint
}