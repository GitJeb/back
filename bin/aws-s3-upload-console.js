'use strict'
const s3Upload = require('../lib/s3-upload.js')
// const Upload = require('../app/models/upload')
const mongoose = require('../app/middleware/mongoose')
const mime = require('mime-types')

// Command Line Options
const options = {
  // add mimetype here
  path: process.argv[2],
  originalname: process.argv[2],
  // notsure
  mimetype: mime.lookup(process.argv[2])
}

console.log('name',options.originalname)
console.log('mime',options.mimetype)

// s3Upload Function returns promise w/ s3Upload response
s3Upload(options)
  // create record in mongoose db
  .then((s3response) => {
    console.log(s3response)
    // return Upload.create({
    //   url: s3response['Location'],
    //   title: process.argv[3]
    // })
    return 'terrible'
  })
  // console.log errors
  .then(console.log)
  .catch(console.error)
  // close mongoose connection to exit command line prompt
  .then(() => mongoose.connection.close())
