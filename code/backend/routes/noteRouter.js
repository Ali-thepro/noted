const noteRouter = require('express').Router()
const { getNotes, getNote, createNote } = require('../controllers/noteController')
const middleware = require('../utils/middleware')

noteRouter.use(middleware.verifyUser)

noteRouter.get('/get', getNotes)
noteRouter.get('/get/:id', getNote)
noteRouter.post('/create', createNote)

module.exports = noteRouter