const userRouter = require('express').Router()
const { signOut } = require('../controllers/userController')

userRouter.post('/signout', signOut)

module.exports = userRouter