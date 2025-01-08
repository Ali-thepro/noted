const userRouter = require('express').Router()
const { signOut } = require('../controllers/userController')
const middleware = require('../utils/middleware')

userRouter.post('/signout', middleware.verifyUser, signOut)

module.exports = userRouter