const versionRouter = require('express').Router()
const { createVersion, getVersions, getVersionChain } = require('../controllers/versionController')
const middleware = require('../utils/middleware')

versionRouter.use(middleware.verifyUser)

versionRouter.post('/:noteId', createVersion)
versionRouter.get('/:noteId/chain', getVersionChain)
versionRouter.get('/:noteId', getVersions)

module.exports = versionRouter
