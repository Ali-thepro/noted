const Note = require('../models/note')
const DeletedNote = require('../models/deletedNote')
const Version = require('../models/version')
const createError = require('../utils/error')

const getNotes = async (request, response, next) => {
  const { tag, search } = request.query
  const user = request.user

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
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
        ],
      } : {}),
    }

    const startIndex = parseInt(request.query.startIndex) || 0
    const limit = parseInt(request.query.limit) || 9
    const sortBy = request.query.sortBy || 'updatedAt'
    const sortOrder = request.query.sortOrder === 'asc' ? 1 : -1

    const total = await Note.countDocuments(filter)
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
  const { title, content, tags } = request.body

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      user: user.id
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

  const title = request.body.title
  const content = request.body.content
  const tags = request.body.tags

  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: id, user: user.id },
      { $set: { title, content, tags } },
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

  try {
    const note = await Note.findOne({ _id: id, user: user.id })
    if (!note) {
      return next(createError('Note not found or unauthorized', 404))
    }

    const deletedNote = new DeletedNote({
      noteId: id,
      tags: note.tags,
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
  const { since, tag } = request.query

  try {
    const filter = {
      user: user.id,
      ...(since ? {
        updatedAt: { $gte: since }
      } : {}),
      ...(tag ? {
        tags: {
          $regex: tag,
          $options: 'i',
        },
      } : {}),
    }

    const notes = await Note.find(filter)
      .select('id title tags updatedAt createdAt')
      .sort({ updatedAt: -1 })

    response.json(notes)
  } catch (error) {
    next(error)
  }
}

const getBulkNotes = async (request, response, next) => {
  const user = request.user
  const { ids } = request.body

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
  const { since, tag } = request.query

  try {
    const filter = {
      user: user.id,
      ...(since ? {
        deletedAt: { $gte: since }
      } : {}),
      ...(tag ? {
        tags: {
          $regex: tag,
          $options: 'i',
        },
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

const createVersion = async (request, response, next) => {
  const { noteId } = request.params
  const { type, content, baseVersion, metadata } = request.body
  const user = request.user

  try {
    const note = await Note.findById({ _id: noteId, user: user.id })
    if (!note) {
      return next(createError('Note not found or unauthorized', 404))
    }

    const latestVersion = await Version.findOne({ noteId })
      .sort({ versionNumber: -1 })
    const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1

    const version = new Version({
      noteId,
      versionNumber,
      type,
      content,
      baseVersion,
      metadata: {
        ...metadata,
      }
    })

    const savedVersion = await version.save()
    response.status(201).json(savedVersion)
  } catch (error) {
    next(error)
  }
}

const getVersions = async (request, response, next) => {
  const { noteId } = request.params
  const user = request.user

  try {
    const note = await Note.findOne({ _id: noteId, user: user.id })
    if (!note) {
      return next(createError('Note not found or unauthorized', 404))
    }

    const versions = await Version.find({ noteId })
      .sort({ versionNumber: -1 })
      .select('versionNumber type metadata createdAt')

    response.json(versions)
  } catch (error) {
    next(error)
  }
}

const getVersion = async (request, response, next) => {
  const { noteId, versionNumber } = request.params
  const user = request.user

  try {
    const note = await Note.findOne({ _id: noteId, user: user.id })
    if (!note) {
      return next(createError('Note not found or unauthorized', 404))
    }

    const version = await Version.findOne({ 
      noteId, 
      versionNumber: parseInt(versionNumber) 
    })

    if (!version) {
      return next(createError('Version not found', 404))
    }

    response.json(version)
  } catch (error) {
    next(error)
  }
}

const getVersionChain = async (request, response, next) => {
  const { noteId, versionNumber } = request.params
  const user = request.user

  try {
    const note = await Note.findOne({ _id: noteId, user: user.id })
    if (!note) {
      return next(createError('Note not found or unauthorized', 404))
    }

    const targetVersion = parseInt(versionNumber)
    const versions = await Version.find({
      noteId,
      versionNumber: { $lte: targetVersion }
    })
      .sort({ versionNumber: -1 })

    if (versions.length === 0) {
      return next(createError('Version chain not found', 404))
    }

    response.json(versions)
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
