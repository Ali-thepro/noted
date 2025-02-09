const { ENCRYPTION_ERRORS } = require('../utils/encryption')

const setup = async (request, response, next) => {
  const { masterPasswordHash, protectedSymmetricKey, iv } = request.body
  const user = request.user

  if (user.masterPasswordHash) {
    throw ENCRYPTION_ERRORS.ENCRYPTION_SETUP_EXISTS
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

const getMasterPasswordHash = async (request, response) => {
  const user = request.user

  if (!user.masterPasswordHash) {
    throw ENCRYPTION_ERRORS.MASTER_PASSWORD_REQUIRED
  }

  response.json({ masterPasswordHash: user.masterPasswordHash })
}

const update_master_password = async (request, response, next) => {
  const { currentMasterPasswordHash, newMasterPasswordHash, newProtectedSymmetricKey, newIv } = request.body
  const user = request.user

  if (!user.masterPasswordHash) {
    throw ENCRYPTION_ERRORS.MASTER_PASSWORD_REQUIRED
  }

  if (user.masterPasswordHash !== currentMasterPasswordHash) {
    throw ENCRYPTION_ERRORS.INVALID_MASTER_PASSWORD
  }

  try {
    user.masterPasswordHash = newMasterPasswordHash
    user.protectedSymmetricKey = newProtectedSymmetricKey
    user.iv = newIv
    await user.save()

    response.json({ message: 'Master password updated successfully' })
  } catch (error) {
    next(error)
  }
}

const getProtectedSymmetricKey = async (request, response) => {
  const user = request.user

  if (!user.protectedSymmetricKey) {
    throw ENCRYPTION_ERRORS.PROTECTED_SYMMETRIC_KEY_REQUIRED
  }

  response.json({ protectedSymmetricKey: user.protectedSymmetricKey })
}

const getIv = async (request, response) => {
  const user = request.user

  response.json({ iv: user.iv })
}

module.exports = {
  setup,
  getMasterPasswordHash,
  update_master_password,
  getProtectedSymmetricKey,
  getIv
}
