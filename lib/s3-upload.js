require('dotenv').config()

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const today = new Date().toISOString().split('T')[0]

const promiseRandomBytes = function () {
  return new Promise(function (resolve, reject) {
    crypto.randomBytes(16, (err, buf) => {
      if (err) {
        reject(err)
      }
      resolve(buf.toString('hex'))
    })
  })
}

const promiseS3Upload = function (file) {
  const params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET_NAME,
    ContentType: file.mimetype,
    Key: `${today}/${file.name}${file.ext}`,
    Body: file.stream
  }

  return new Promise((resolve, reject) => {
    s3.upload(params, function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

// We pass options to s3Upload
const s3Upload = function (file) {
  file.stream = fs.createReadStream(file.path)
    // expects path/to/file.jpg
  file.ext = path.extname(file.originalname)

  // expect that mimetype is passed in.
  return promiseRandomBytes()
    .then((randomString) => {
      file.name = randomString
      return file
    })
    .then(promiseS3Upload)
}

module.exports = s3Upload
