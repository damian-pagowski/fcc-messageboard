'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const expect = require('chai').expect
const cors = require('cors')
const mongoose = require('mongoose')
const apiRoutes = require('./routes/api.js')
const fccTestingRoutes = require('./routes/fcctesting.js')
const runner = require('./test-runner')
require('dotenv').config()

const app = express()
const helmet = require('helmet')
app.use('/public', express.static(process.cwd() + '/public'))

app.use(cors({ origin: '*' })) // For FCC testing purposes only

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(helmet({ referrerPolicy: { policy: 'same-origin' } }))

const PORT = process.env.PORT || 3000
const DB_URI = process.env.MONGOLAB_URI || 3000
// console.log
mongoose.connect(DB_URI, { useNewUrlParser: true })

// Sample front-end
app.route('/b/:board/').get(function (req, res) {
  res.sendFile(process.cwd() + '/views/board.html')
})
app.route('/b/:board/:threadid').get(function (req, res) {
  res.sendFile(process.cwd() + '/views/thread.html')
})

// Index page (static HTML)
app.route('/').get(function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html')
})

// For FCC testing purposes
fccTestingRoutes(app)

// Routing for API
apiRoutes(app)

// Sample Front-end

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type('text').send('Not Found')
})

// Start our server and tests!
app.listen(PORT, function () {
  console.log('Listening on port ' + PORT)
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...')
    setTimeout(function () {
      try {
        runner.run()
      } catch (e) {
        const error = e
        console.log('Tests are not valid:')
        console.log(error)
      }
    }, 1500)
  }
})

module.exports = app // for testing
