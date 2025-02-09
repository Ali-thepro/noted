const { ENCRYPTION_ERRORS } = require('../utils/encryption')

const setup = async (request, response, next) => {
  const { masterPasswordHash, protectedSymmetricKey } = request.body
  const user = request.user

  if (user.masterPasswordHash) {
    throw ENCRYPTION_ERRORS.ENCRYPTION_SETUP_EXISTS
  }

  try {
    user.masterPasswordHash = masterPasswordHash
    user.protectedSymmetricKey = protectedSymmetricKey
    await user.save()

    response.status(201).json({ message: 'Encryption setup successful' })
  } catch (error) {
    next(error)
  }
}

const verify = async (request, response) => {
  const { masterPasswordHash } = request.body
  const user = request.user

  if (!user.masterPasswordHash) {
    throw ENCRYPTION_ERRORS.MASTER_PASSWORD_REQUIRED
  }

  if (user.masterPasswordHash !== masterPasswordHash) {
    throw ENCRYPTION_ERRORS.INVALID_MASTER_PASSWORD
  }

  response.status(200).json({
    protectedSymmetricKey: user.protectedSymmetricKey
  })
}

const update_master_password = async (request, response, next) => {
  const { currentMasterPasswordHash, newMasterPasswordHash, newProtectedSymmetricKey } = request.body
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
    await user.save()

    response.json({ message: 'Master password updated successfully' })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  setup,
  verify,
  update_master_password
}
