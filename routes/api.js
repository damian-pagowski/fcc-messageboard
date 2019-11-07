/*
*
*
*       Complete the API routing below
*
*
*/

'use strict'

const expect = require('chai').expect
const models = require('../models/db_models')
const { Thread, Reply } = models
module.exports = function (app) {
  app
    .route('/api/threads/:board')
    .get(function (req, res) {
      const { limit, thread_id } = req.query
      const { board } = req.params
      if (thread_id) {
        console.log('Thread id : ' + thread_id)
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
      //  create thread
      let thread = new Thread({ text, deletePassword: delete_password, board })
      thread.save().then(r => res.json(r))
    })
    .put(function (req, res) {
      // const { board } = req.params
      const { thread_id } = req.body
      // ndoneandupdate-doesnt-return-updated-document
      // https://stackoverflow.com/questions/32811510/mongoose-findoneandupdate-doesnt-return-updated-document
      // new: bool - if true, return the modified document rather than the original. defaults to false (changed in 4.0)
      if (!thread_id) {
        res.status(400).json({ error: 'invalid thread identifier' })
      } else {
        Thread.findOneAndUpdate(
          { _id: thread_id },
          { $set: { reported: true } },
          { new: true }
        ).then(result => res.json({ result }))
      }
    })
    .delete(function (req, res) {
      const { board } = req.params
      const { thread_id, delete_password } = req.body
      Thread.findOneAndDelete({
        _id: thread_id,
        deletePassword: delete_password
      }).then(
        result =>
          result
            ? res.json({ status: 'success' })
            : res.status(400).json({ error: 'incorrect password' })
      )
    })
  app
    .route('/api/replies/:board')
    .get(function (req, res) {
      const { limit, thread_id } = req.query
      Reply.getReplies(thread_id, limit).then(
        result => res.json({ replies: result }) // The reported and delete_passwords fields will not be sent
      )
    })
    .post(function (req, res) {
      const { board } = req.params
      const { thread_id, delete_password, text } = req.body
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
              .then(result => res.json({ result }))
          )
        )
    })
    .put(function (req, res) {
      const { reply_id } = req.body
      if (!reply_id) {
        res.status(400).json({ error: 'invalid reply identifier' })
      } else {
        Reply.findOneAndUpdate(
          { _id: reply_id },
          { $set: { reported: true } },
          { new: true }
        )
          .then(result => res.json({ result: 'success' }))
          .catch()
      }
    })
    .delete(function (req, res) {
      const { reply_id, delete_password } = req.body
      if (!reply_id) {
        res.status(400).json({ error: 'invalid reply identifier' })
      } else {
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
      }
    })
}
