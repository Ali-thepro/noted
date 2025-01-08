const authRouter = require('express').Router()
const { signup, signin, google, googleOauth } = require('../controllers/authController')

authRouter.post('/signup', signup)
authRouter.post('/signin', signin)
authRouter.get('/google', googleOauth)
authRouter.get('/google/callback', google)

module.exports = authRouter