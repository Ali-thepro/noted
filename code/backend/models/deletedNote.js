const mongoose = require('mongoose')

const deletedNoteSchema = new mongoose.Schema(
  {
    noteId: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    deletedAt: {
      type: Date,
      default: Date.now
    }
  }
)

deletedNoteSchema.index({ user: 1, deletedAt: 1, tags: 1 })

deletedNoteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('DeletedNote', deletedNoteSchema)
