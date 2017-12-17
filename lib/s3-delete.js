require('dotenv').config()

const AWS = require('aws-sdk')
const s3 = new AWS.S3()

const s3DeletePromise = function (params) {
  return new Promise((resolve, reject) => {
    s3.deleteObject(params, function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

const s3Delete = function (key) {
  const params = {
    Key: key,
    Bucket: process.env.AWS_BUCKET_NAME
  }
  return s3DeletePromise(params)
}

module.exports = s3Delete
