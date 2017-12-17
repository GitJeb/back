'use strict'
const mongoose = require('../../app/middleware/mongoose')
const controller = require('lib/wiring/controller')
const models = require('app/models')
const Upload = models.upload
const User = models.user


// Multer
const multer = require('multer')
const multerUpload = multer({ dest: '/tmp' })

// AWS s#
const s3Upload = require('../../lib/s3-upload.js')
const s3Delete = require('../../lib/s3-delete.js')

// Set User Actions
const authenticate = require('./concerns/authenticate')
const setUser = require('./concerns/set-current-user')
const setModel = require('./concerns/set-mongoose-model')

const index = (req, res, next) => {
  Upload.find()
    .populate('_owner')
    .then(uploads => res.json({
      uploads: uploads.map((e) => {
        return e.toJSON({virtuals: true, user: req.user})
      })
    }))
    .catch(next)
}

const show = (req, res) => {
  res.json({
    upload: req.upload.toJSON({ virtuals: true, user: req.user })
  })
}

const create = (req, res, next) => {
  const options = {
    path: req.file.path,
    title: req.body.image.title,
    mimetype: req.file.mimetype,
    originalname: req.file.originalname
  }

  s3Upload(options)
    .then((s3response) => {
      const upload = Object.assign(req.body.image, {
        _owner: req.user._id,
        url: s3response['Location'],
        title: options.title,
        aws_key: s3response.Key
      })
      return Upload.create(upload)
    })
    .then(upload => {
      return res.status(201)
        .json({
          upload: upload.toJSON()
        })
    })
    .catch(next)
}

const update = (req, res, next) => {
  delete req.body.upload._owner  // disallow owner reassignment.
  const options = {
    path: req.file.path,
    title: req.body.image.title,
    mimetype: req.file.mimetype,
    originalname: req.file.originalname
  }
  s3Upload(options)
    .then((s3response) => {
      return req.upload.update(req.body.upload)
    })
    .then(upload => {
      return res.status(204)
        .json({
          upload: upload.toJSON()
        })
    })
    .catch(next)
}

const destroy = (req, res, next) => {
  req.upload.remove()
    .then(() => s3Delete(req.upload.aws_key))
    .then(() => res.status(200).json({ message: 'Successfully deleted' }))
    .catch(next)

  // Upload.remove({
  //   _id: req.upload._id
  // }, function (err, upload) {
  //   if (err) {
  //     res.send(err)
  //   }
  //   res.json({ message: 'Successfully deleted' })
  // })
}

module.exports = controller({
  index,
  show,
  create,
  update,
  destroy
}, { before: [
  { method: setUser, only: ['index', 'show', 'create'] },
  { method: authenticate, except: ['index', 'show', 'create'] },
  { method: setModel(Upload), only: ['show'] },
  { method: setModel(Upload, { forUser: true }), only: ['update', 'destroy'] },
  { method: multerUpload.single('image[file]'), only: ['create'] }
] })
