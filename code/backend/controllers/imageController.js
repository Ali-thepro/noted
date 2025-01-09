const AWS = require('aws-sdk')
require('aws-sdk/lib/maintenance_mode_message').suppress = true
const fs = require('fs')
const config = require('../utils/config')
const { v4: uuidv4 } = require('uuid')


const s3 = new AWS.S3({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_KEY,
  region: config.AWS_BUCKET_REGION
})

const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  const filePath = req.file.path
  const fileContent = fs.readFileSync(filePath)

  const uniqueFilename = uuidv4() + '-' + Date.now() + '-' + req.file.originalname

  const params = {
    Bucket: config.AWS_BUCKET_NAME,
    Key: uniqueFilename,
    Body: fileContent,
    ContentType: req.file.mimetype,
  }

  s3.upload(params, (err, data) => {
    if (err) {
      console.log(err)
      return res.status(500).json({ error: 'Upload to S3 failed' })
    }
    console.log(data)
    fs.unlinkSync(filePath)
    return res.status(200).json({ imageUrl: data.Location })
  })

}


module.exports = {
  uploadImage
}