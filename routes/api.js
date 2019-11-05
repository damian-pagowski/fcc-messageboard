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
      //  I can GET an array of the most recent 10 bumped threads on the board
      // with only the most recent 3 replies from /api/threads/{board}.
      // The reported and delete_passwords fields will not be sent.
      const { limit } = req.query || 10
      const { board } = req.params
      Thread.getThreads(board, limit).then(
        result => res.json({ threads: result }) // The reported and delete_passwords fields will not be sent
      )
      //  add replies to posts
    })
    .post(function (req, res) {
      //  extract data from post req body and path
      const { text, deletePassword } = req.body
      const { board } = req.params
      //  create thread
      let thread = new Thread({ text, deletePassword, board })
      thread.save().then(r => res.json(r))

      // console.log([text, deletePassword, board])
      // res.json({ params: [board, text, deletePassword] })
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
        ).then(result => res.json({ result: result }))
      }
    })
    .delete(function (req, res) {
      const { board } = req.params
      const { thread_id, delete_password } = req.body
      Thread.findById(thread_id).then(result => {
        if (
          result &&
          delete_password &&
          result.deletePassword == delete_password
        ) {
          result
            .remove()
            .then(deleteResult => res.json({ data: deleteResult }))
        } else {
          res
            .status(400)
            .json({ error: 'invalid thread identifier or delete password' })
        }
      })
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
      reply.save().then(responseCreate => res.json(responseCreate))
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
        ).then(result => res.json({ result: result }))
      }
    })
    .delete(function (req, res) {
      const { reply_id } = req.body
      if (!reply_id) {
        res.status(400).json({ error: 'invalid reply identifier' })
      } else {
        Reply.findOneAndUpdate(
          { _id: reply_id },
          { $set: { text: '[deleted]' } },
          { new: true }
        ).then(result => res.json({ result: result }))
      }
    })
}
