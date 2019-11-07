/*
*
*
*       Complete the API routing below
*
*
*/

'use strict'
const mongoose = require('mongoose')
const expect = require('chai').expect
const models = require('../models/db_models')
const { Thread, Reply } = models

const INVALID_THREAD_ID = 'Invalid Thread Reference'
const INVALID_REPLY_ID = 'Invalid Reply Reference'
module.exports = function (app) {
  app
    .route('/api/threads/:board')
    .get(function (req, res) {
      const { limit, thread_id } = req.query
      const { board } = req.params
      if (thread_id) {
        Thread.getThreadWithReplies(thread_id).then(rsp => res.json(rsp))
      } else {
        Thread.getThreads(board, limit || 10).then(threads =>
          Promise.all(threads.map(t => t.withLatestReplies(3))).then(rsp =>
            res.json(rsp)
          )
        )
      }
    })
    .post(function (req, res) {
      const { text, delete_password } = req.body
      const { board } = req.params
      let thread = new Thread({ text, deletePassword: delete_password, board })
      thread
        .save()
        .then(() => res.json({ status: 'Thread Created' }))
        .catch(error =>
          res.status(400).json({ error: 'cannot create thread' })
        )
    })
    .put(function (req, res) {
      // const { board } = req.params
      const { thread_id } = req.body
      // ndoneandupdate-doesnt-return-updated-document
      // https://stackoverflow.com/questions/32811510/mongoose-findoneandupdate-doesnt-return-updated-document
      // new: bool - if true, return the modified document rather than the original. defaults to false (changed in 4.0)
      if (!thread_id) {
        res.status(400).json({ error: INVALID_THREAD_ID })
      } else {
        Thread.findOneAndUpdate(
          { _id: thread_id },
          { $set: { reported: true } },
          { new: true }
        )
          .then(result => res.json({ status: 'success' }))
          .catch(error => res.status(400).json({ error: 'Update failed' }))
      }
    })
    .delete(function (req, res) {
      const { board } = req.params
      const { thread_id, delete_password } = req.body
      if (mongoose.Types.ObjectId.isValid(thread_id)) {
        Thread.findOneAndUpdate(
          {
            _id: thread_id,
            deletePassword: delete_password
          },
          { $set: { text: '[deleted]' } },
          { new: true }
        )
          .then(
            result =>
              result
                ? res.json({ status: 'success' })
                : res.status(400).json({ error: 'incorrect password' })
          )
          .catch(error => res.status(400).json({ error: 'Update failed' }))
      } else {
        res.status(400).json({ error: INVALID_THREAD_ID })
      }
    })
  app
    .route('/api/replies/:board')
    .get(function (req, res) {
      const { limit, thread_id } = req.query
      if (mongoose.Types.ObjectId.isValid(thread_id)) {
        Reply.getReplies(thread_id, limit).then(
          result => res.json(result) // The reported and delete_passwords fields will not be sent
        )
      } else {
        res.status(400).json({ error: INVALID_THREAD_ID })
      }
    })
    .post(function (req, res) {
      const { board } = req.params
      const { thread_id, delete_password, text } = req.body
      if (thread_id && mongoose.Types.ObjectId.isValid(thread_id)) {
        let reply = new Reply({
          text,
          deletePassword: delete_password,
          board,
          thread: thread_id
        })
        reply
          .save()
          .then(responseCreate =>
            Thread.findById(responseCreate.thread).then(foundThread =>
              foundThread
                .addReply(responseCreate._id)
                .then(result => res.json({ status: 'Reply Created' }))
                .catch(error =>
                  res.status(400).json({ error: 'Cannot create reply' })
                )
            )
          )
      } else {
        res.status(400).json({ error: INVALID_THREAD_ID })
      }
    })
    .put(function (req, res) {
      const { reply_id, delete_password } = req.body

      if (reply_id && delete_password && mongoose.Types.ObjectId.isValid(reply_id)) {
        Reply.findOneAndUpdate(
          { _id: reply_id, deletePassword: delete_password },
          { $set: { reported: true } },
          { new: true }
        )
          .then(result => res.json({ status: 'success' }))
          .catch()
      } else {
        res.status(400).json({ error: INVALID_REPLY_ID })
      }
    })
    .delete(function (req, res) {
      const { reply_id, delete_password } = req.body
      if (mongoose.Types.ObjectId.isValid(reply_id)) {
        Reply.findOneAndUpdate(
          { _id: reply_id, deletePassword: delete_password },
          { $set: { text: '[deleted]' } },
          { new: true }
        )
          .then(
            result =>
              result
                ? res.json({ status: 'success' })
                : res.status(400).json({ error: 'incorrect password' })
          )
          .catch(error => res.json({ error }))
      } else {
        res.status(400).json({ error: INVALID_REPLY_ID })
      }
    })
}
