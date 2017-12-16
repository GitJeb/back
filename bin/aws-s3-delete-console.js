// const s3Upload = require('../lib/s3-upload.js')
// const Upload = require('../app/models/upload')
// const mongoose = require('../app/middleware/mongoose')
const s3Delete = require('../lib/s3-delete.js')


const params = {
  Key: process.argv[2]
}

console.log(params.Key)
s3Delete(params)
