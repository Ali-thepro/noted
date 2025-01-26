const noteRouter = require('express').Router()
const { getNotes, getNote, createNote, updateNote, deleteNote, getNoteMetadata, getBulkNotes } = require('../controllers/noteController')
const middleware = require('../utils/middleware')

noteRouter.use(middleware.verifyUser)

noteRouter.get('/get', getNotes)
noteRouter.get('/get/:id', getNote)
noteRouter.post('/create', createNote)
noteRouter.put('/update/:id', updateNote)
noteRouter.delete('/delete/:id', deleteNote)
noteRouter.get('/metadata', getNoteMetadata)
noteRouter.post('/bulk', getBulkNotes)

module.exports = noteRouter
