const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    tags: [{
      type: String,
    }],
    cipherKey: {
      type: String,
      required: true
    },
    cipherIv: {
      type: String,
      required:true
    },
    contentIv: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

noteSchema.index({ user: 1, updatedAt: -1 })


noteSchema.path('tags').validate(function (value) {
  const uniqueTags = new Set(value)
  return value.length === uniqueTags.size
}, 'Tags must be unique')

noteSchema.path('tags').validate(function (value) {
  return value.every(tag => tag.length <= 20)
}, 'Tags cannot be more than 20 characters')


noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Note', noteSchema)
