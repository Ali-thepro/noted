const createError = require('./error')

const ENCRYPTION_ERRORS = {
  MASTER_PASSWORD_REQUIRED: createError('Master password setup required', 403),
  INVALID_MASTER_PASSWORD: createError('Invalid master password', 401),
  ENCRYPTION_SETUP_EXISTS: createError('Encryption is already set up', 400),
}

const ARGON2_CONFIG = {
  timeCost: 4,
  memoryCost: 65536,
  parallelism: 3
}

module.exports = {
  ENCRYPTION_ERRORS,
  ARGON2_CONFIG
}
