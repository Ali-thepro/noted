const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: [5, 'username must be at least 5 characters long'],
      maxlength: [20, 'username must not be more than 20 characters'],
      validate: [
        {
          validator: function (v) {
            return /^[a-zA-Z0-9]+([-_][a-zA-Z0-9]+)*$/.test(v)
          },
          message: () => {
            return 'username can only contain letters and numbers'
          }
        }
      ]
    },
    email: {
      type: String,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    oauth: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      required: true,
      enum: ['local', 'google', 'github'],
    },
    masterPasswordHash: {
      type: String,
      required: false,
    },
    protectedSymmetricKey: {
      type: String,
      required: false
    },
    iv: {
      type: String,
    },
    passwordResetToken: {
      type: String,
      default: null
    },
    passwordResetExpires: {
      type: Date,
      default: null
    }
  }
)

userSchema.index({ email: 1, provider: 1 }, { unique: [true, 'expected email to be unique'] })

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
    delete returnedObject.masterPasswordHash
    delete returnedObject.protectedSymmetricKey
    delete returnedObject.iv
  }
})

module.exports = mongoose.model('User', userSchema)
