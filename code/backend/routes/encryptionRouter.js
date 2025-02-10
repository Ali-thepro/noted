const encryptionRouter = require('express').Router()
const { setup, getMasterPasswordHash, getProtectedSymmetricKey, getIv } = require('../controllers/encryptionController')
const middleware = require('../utils/middleware')

encryptionRouter.use(middleware.verifyUser)

encryptionRouter.post('/setup', setup)
encryptionRouter.get('/password', getMasterPasswordHash)
encryptionRouter.get('/symmetric-key', getProtectedSymmetricKey)
encryptionRouter.get('/iv', getIv)

module.exports = encryptionRouter
