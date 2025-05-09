const Note = require('../models/note')
const DeletedNote = require('../models/deletedNote')
const createError = require('../utils/error')


const getNotes = async (request, response, next) => {
  const { tag, search } = request.query
  const user = request.user

  if (!user.masterPasswordHash) {
    return next(createError('Please create a master password', 400))
  }

  try {
    const filter = {
      user: user.id,
      ...(tag ? {
        tags: {
          $regex: tag,
          $options: 'i',
        },
      } : {}),
      ...(search ? {
        title: {
          $regex: search,
          $options: 'i'
        }
      } : {}),
    }

    const total = await Note.countDocuments(filter)

    const startIndex = parseInt(request.query.startIndex) || 0
    const limit = parseInt(request.query.limit) || total
    const sortBy = request.query.sortBy || 'updatedAt'
    const sortOrder = request.query.sortOrder === 'asc' ? 1 : -1

    const notes = await Note.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(startIndex)
      .limit(limit)
    response.json({ notes, total })
  } catch (error) {
    next(error)
  }
}

const getNote = async (request, response, next) => {
  const { id } = request.params
  const user = request.user

  if (!user.masterPasswordHash) {
    return next(createError('Please create a master password', 400))
  }

  try {
    const note = await Note.findOne({ _id: id, user: user.id })
    if (!note) {
      return next(createError('Note not found or unauthorized', 404))
    }

    response.json(note)
  } catch (error) {
    next(error)
  }
}

const createNote = async (request, response, next) => {
  const user = request.user
  const { title, content, tags, cipherKey, cipherIv, contentIv } = request.body

  if (!user.masterPasswordHash) {
    return next(createError('Please create a master password', 400))
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      cipherKey,
      cipherIv,
      contentIv,
      user: user.id,
    })

    const savedNote = await note.save()
    response.status(201).json(savedNote)
  } catch (error) {
    next(error)
  }
}

// const updateNote = async (request, response, next) => {
//   const { id } = request.params
//   const user = request.user
//   const { title, content, tags } = request.body

//   try {
//     const note = await Note.findOne({ _id: id, user: user.id })
//     if (!note) {
//       return next(createError('Note not found or unauthorized', 404))
//     }

//     note.title = title
//     note.content = content
//     note.tags = tags || []

//     const updatedNote = await note.save()
//     response.json(updatedNote)
//   } catch (error) {
//     next(error)
//   }
// }


const updateNote = async (request, response, next) => {
  const { id } = request.params
  const user = request.user
  const { title, content, tags, cipherKey, cipherIv, contentIv } = request.body

  if (!user.masterPasswordHash) {
    return next(createError('Please create a master password', 400))
  }

  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: id, user: user.id },
      {
        $set: {
          title,
          content,
          tags,
          cipherKey,
          cipherIv,
          contentIv
        }
      },
      { new: true, runValidators: true }
    )

    if (!updatedNote) {
      return next(createError('Note not found or unauthorized', 404))
    }

    response.json(updatedNote)
  } catch (error) {
    next(error)
  }
}


const deleteNote = async (request, response, next) => {
  const { id } = request.params
  const user = request.user

  if (!user.masterPasswordHash) {
    return next(createError('Please create a master password', 400))
  }

  try {
    const note = await Note.findOne({ _id: id, user: user.id })
    if (!note) {
      return next(createError('Note not found or unauthorized', 404))
    }

    const deletedNote = new DeletedNote({
      noteId: id,
      user: user.id
    })

    await deletedNote.save()
    await Note.findByIdAndDelete(id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}

const getNoteMetadata = async (request, response, next) => {
  const user = request.user
  const { since } = request.query

  if (!user.masterPasswordHash) {
    return next(createError('Please create a master password', 400))
  }

  try {
    const filter = {
      user: user.id,
      ...(since ? {
        updatedAt: { $gte: since }
      } : {})
    }

    const notes = await Note.find(filter)
      .select('id updatedAt createdAt')
      .sort({ updatedAt: -1 })

    response.json(notes)
  } catch (error) {
    next(error)
  }
}

const getBulkNotes = async (request, response, next) => {
  const user = request.user
  const { ids } = request.body

  if (!user.masterPasswordHash) {
    return next(createError('Please create a master password', 400))
  }

  if (!Array.isArray(ids)) {
    return next(createError('Invalid request : ids must be an array', 400))
  }

  try {
    const notes = await Note.find({
      _id: { $in: ids },
      user: user.id
    })
    response.json(notes)
  } catch (error) {
    next(error)
  }
}

const getDeletedNotes = async (request, response, next) => {
  const user = request.user
  const { since } = request.query

  if (!user.masterPasswordHash) {
    return next(createError('Please create a master password', 400))
  }

  try {
    const filter = {
      user: user.id,
      ...(since ? {
        deletedAt: { $gte: since }
      } : {}),
    }

    const deletedNotes = await DeletedNote.find(filter)
      .select('noteId deletedAt')
      .sort({ deletedAt: -1 })

    response.json(deletedNotes)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  getNoteMetadata,
  getBulkNotes,
  getDeletedNotes
}
