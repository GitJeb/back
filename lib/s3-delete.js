require('dotenv').config()

const AWS = require('aws-sdk')
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const s3Delete = function (params) {
  params.Bucket = process.env.AWS_BUCKET_NAME

  s3.deleteObject(params, function (err, data) {
    if (err) console.log(err, err.stack)
    else console.log(data)
  })
}

module.exports = s3Delete
