const multer = require('multer')
const imageRouter = require('express').Router()
const { uploadImage } = require('../controllers/imageController')
const middleware = require('../utils/middleware')


const upload = multer({ dest: 'uploads/' })

imageRouter.post('/upload', middleware.verifyUser, upload.single('image'), uploadImage)

module.exports = imageRouter