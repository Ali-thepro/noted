const encryptionRouter = require('express').Router()
const { setup, getMasterPasswordHash, update_master_password, getProtectedSymmetricKey, getIv } = require('../controllers/encryptionController')
const middleware = require('../utils/middleware')

encryptionRouter.use(middleware.verifyUser)

encryptionRouter.get('/setup', setup)
encryptionRouter.get('/password', getMasterPasswordHash)
encryptionRouter.post('/update-password', update_master_password)
encryptionRouter.get('/symmetric-key', getProtectedSymmetricKey)
encryptionRouter.get('/info', getIv)

module.exports = encryptionRouter
