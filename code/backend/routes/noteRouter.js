const noteRouter = require('express').Router()
const { getNotes, getNote, createNote, updateNote, deleteNote } = require('../controllers/noteController')
const middleware = require('../utils/middleware')

noteRouter.use(middleware.verifyUser)

noteRouter.get('/get', getNotes)
noteRouter.get('/get/:id', getNote)
noteRouter.post('/create', createNote)
noteRouter.put('/update/:id', updateNote)
noteRouter.delete('/delete/:id', deleteNote)

module.exports = noteRouter
