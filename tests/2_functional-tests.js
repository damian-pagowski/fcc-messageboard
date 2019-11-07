/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http')
var chai = require('chai')
var assert = chai.assert
var server = require('../server')

chai.use(chaiHttp)

const board = 'test'

const threadTest = {
  text: 'lorem ipsum',
  delete_password: 'secure password'
}

const replyTest = {
  delete_password: threadTest.delete_password,
  thread_id: threadTest.id,
  text: 'lorem ipsum'
}

suite('Functional Tests', function () {
  suite('API ROUTING FOR /api/threads/:board', function () {
    suite('POST', function () {
      test('Create new thread - valid parameters', function (done) {
        chai
          .request(server)
          .post(`/api/threads/${board}`)
          .send(threadTest)
          .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.property(res.body, 'status')
            assert.equal(res.body.status, 'Thread Created')
            assert.notProperty(res.body, 'deletePassword')
            assert.notProperty(res.body, 'delete_password')
            done()
          })
      })

      test('Create new thread - missing parameters - password', function (done) {
        chai
          .request(server)
          .post(`/api/threads/${board}`)
          .send({ text: 'text' })
          .end(function (err, res) {
            assert.equal(res.status, 400)
            assert.property(res.body, 'error')
            assert.equal(res.body.error, 'cannot create thread')
            done()
          })
      })
      test('Create new thread - missing parameters - text', function (done) {
        chai
          .request(server)
          .post(`/api/threads/${board}`)
          .send({ delete_password: 'secret' })
          .end(function (err, res) {
            assert.equal(res.status, 400)
            assert.property(res.body, 'error')
            assert.equal(res.body.error, 'cannot create thread')
            done()
          })
      })
    })

    suite('GET', function () {
      test('get all threads with replies', function (done) {
        chai
          .request(server)
          .get(`/api/threads/${board}`)
          .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.isArray(res.body)
            assert.property(res.body[0], 'text')
            assert.equal(res.body[0].text, threadTest.text)
            assert.notProperty(res.body[0], 'deletePassword')
            assert.property(res.body[0], 'replies')
            assert.isArray(res.body[0].replies)
            threadTest.id = res.body[0]._id
            done()
          })
      })

      test('get single thread by thread id', function (done) {
        chai
          .request(server)
          .get(`/api/threads/${board}`)
          .query({ thread_id: threadTest.id })
          .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.property(res.body, 'text')
            assert.equal(res.body.text, threadTest.text)

            assert.property(res.body, '_id')
            assert.equal(res.body._id, threadTest.id)

            assert.property(res.body, 'board')
            assert.equal(res.body.board, board)

            assert.property(res.body, 'created_on')
            assert.property(res.body, 'bumped_on')
            assert.property(res.body, 'replyCount')
            assert.equal(res.body.replyCount, 0)

            assert.property(res.body, 'replies')
            assert.isArray(res.body.replies)
            assert.notProperty(res.body, 'deletePassword')

            done()
          })
      })
    })

    suite('PUT', function () {
      test('Update thread - set reported field to true', function (done) {
        chai
          .request(server)
          .put(`/api/threads/${board}`)
          .send({
            delete_password: threadTest.delete_password,
            thread_id: threadTest.id
          })
          .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.property(res.body, 'status')
            assert.equal(res.body.status, 'success')
            done()
          })
      })
    })
    suite('DELETE', function () {
      test('Delete thread', function (done) {
        chai
          .request(server)
          .delete(`/api/threads/${board}`)
          .send({
            delete_password: threadTest.delete_password,
            thread_id: threadTest.id
          })
          .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.property(res.body, 'status')
            assert.equal(res.body.status, 'success')
            done()
          })
      })
    })

    suite('API ROUTING FOR /api/replies/:board', function () {
      suite('POST', function () {
        test('create reply - invalid thread reference', function (done) {
          chai
            .request(server)
            .post(`/api/replies/${board}`)
            .send({
              delete_password: threadTest.delete_password,
              thread_id: '1234567890',
              text: 'lorem ipsum'
            })
            .end(function (err, res) {
              assert.equal(res.status, 400)
              assert.property(res.body, 'error')
              assert.equal(res.body.error, 'Invalid Thread Reference')
              done()
            })
        })

        test('create reply - not existing thread reference', function (done) {
          chai
            .request(server)
            .post(`/api/threads/${board}`)
            .send({
              delete_password: threadTest.delete_password,
              thread_id: '5dc419d3171e896074b532fa'
            })
            .end(function (err, res) {
              assert.equal(res.status, 400)
              assert.property(res.body, 'error')
              assert.equal(res.body.error, 'cannot create thread')
              done()
            })
        })
        test('create reply - valid reference', function (done) {
          chai
            .request(server)
            .post(`/api/replies/${board}`)
            .send({
              delete_password: threadTest.delete_password,
              thread_id: threadTest.id,
              text: replyTest.text
            })
            .end(function (err, res) {
              assert.equal(res.status, 200)
              assert.property(res.body, 'status')
              assert.equal(res.body.status, 'Reply Created')
              done()
            })
        })
      })

      suite('GET', function () {
        test('GET all replies for a thred', function (done) {
          chai
            .request(server)
            .get(`/api/replies/${board}`)
            .query({
              thread_id: threadTest.id
            })
            .end(function (err, res) {
              assert.equal(res.status, 200)
              assert.isArray(res.body)
              assert.property(res.body[0], '_id')
              replyTest.id = res.body[0]._id

              assert.property(res.body[0], 'text')
              assert.equal(res.body[0].text, replyTest.text)
              assert.property(res.body[0], 'thread')
              assert.equal(res.body[0].thread, threadTest.id)
              assert.property(res.body[0], 'created_on')
              done()
            })
        })

        test('GET all replies for a thred - invalid thread reference', function (
          done
        ) {
          chai
            .request(server)
            .get(`/api/replies/${board}`)
            .query({
              thread_id: 'invalid'
            })
            .end(function (err, res) {
              assert.equal(res.status, 400)
              assert.property(res.body, 'error')
              assert.equal(res.body.error, 'Invalid Thread Reference')
              done()
            })
        })
      })

      suite('PUT', function () {
        test('Update reply - set report property to true', function (done) {
          chai
            .request(server)
            .put(`/api/replies/${board}`)
            .send({
              reply_id: replyTest.id,
              delete_password: threadTest.delete_password
            })
            .end(function (err, res) {
              assert.equal(res.status, 200)
              assert.property(res.body, 'status')
              assert.equal(res.body.status, 'success')
              done()
            })
        })

        test('Update reply - missing parameters - password', function (done) {
          chai
            .request(server)
            .put(`/api/replies/${board}`)
            .send({
              reply_id: replyTest.id
            })
            .end(function (err, res) {
              assert.equal(res.status, 400)
              assert.property(res.body, 'error')
              assert.equal(res.body.error, 'Invalid Reply Reference')
              done()
            })
        })
      })

      suite('DELETE', function () {
        test('DELETE reply - valid parameters', function (done) {
          chai
            .request(server)
            .delete(`/api/replies/${board}`)
            .send({
              reply_id: replyTest.id,
              delete_password: threadTest.delete_password
            })
            .end(function (err, res) {
              assert.equal(res.status, 200)
              assert.property(res.body, 'status')
              assert.equal(res.body.status, 'success')
              done()
            })
        })

        test('DELETE reply - incorrect password', function (done) {
          chai
            .request(server)
            .delete(`/api/replies/${board}`)
            .send({
              reply_id: replyTest.id,
              delete_password: "blah"
            })
            .end(function (err, res) {
              assert.equal(res.status, 400)
              assert.property(res.body, 'error')
              assert.equal(res.body.error, 'incorrect password')
              done()
            })
        })
        //
        
        test('DELETE reply - invalid reply reference', function (done) {
          chai
            .request(server)
            .delete(`/api/replies/${board}`)
            .send({
              reply_id: 'blah',
              delete_password: threadTest.delete_password
            })
            .end(function (err, res) {
              assert.equal(res.status, 400)
              assert.property(res.body, 'error')
              assert.equal(res.body.error, 'Invalid Reply Reference')
              done()
            })
        })

      })
    })
  })
})
