const encryptionRouter = require('express').Router()
const { setup, verify, update_master_password } = require('../controllers/encryptionController')
const middleware = require('../utils/middleware')

encryptionRouter.use(middleware.verifyUser)

encryptionRouter.get('/setup', setup)
encryptionRouter.get('/verify', verify)
encryptionRouter.post('/update-master-password', update_master_password)

module.exports = encryptionRouter
