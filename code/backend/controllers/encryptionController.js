const createError = require('../utils/error')

const setup = async (request, response, next) => {
  const { masterPasswordHash, protectedSymmetricKey, iv } = request.body
  const user = request.user

  if (user.masterPasswordHash) {
    return next(createError('Encryption is already set up', 400))
  }

  try {
    user.masterPasswordHash = masterPasswordHash
    user.protectedSymmetricKey = protectedSymmetricKey
    user.iv = iv
    await user.save()

    response.status(201).json({ message: 'Encryption setup successful' })
  } catch (error) {
    next(error)
  }
}

const getMasterPasswordHash = async (request, response, next) => {
  try {
    const user = request.user
    response.json(user.masterPasswordHash)
  } catch (error) {
    next(error)
  }
}

const getProtectedSymmetricKey = async (request, response, next) => {
  try {
    const user = request.user
    response.json(user.protectedSymmetricKey)
  } catch (error) {
    next(error)
  }
}

const getIv = async (request, response, next) => {
  try {
    const user = request.user
    response.json(user.iv)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  setup,
  getMasterPasswordHash,
  getProtectedSymmetricKey,
  getIv
}
