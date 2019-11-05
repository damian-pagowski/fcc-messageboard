const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Thread aka Post. Board must be property (aka category aka something like subredit?)
const ThreadSchema = new Schema({
  text: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false, required: true },
  deletePassword: { type: String, required: true },
  replies: [
    { type: Schema.Types.ObjectId, ref: 'Reply', default: [], required: true }
  ],
  board: { type: String, required: true }
})

ThreadSchema.statics.getThreads = function (board, limit) {
  return this.find({ board }).sort({ date: -1 }).limit(parseInt(limit))
}

const ReplySchema = new Schema({
  text: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false, required: true },
  deletePassword: { type: String, required: true },
  thread: {
    type: Schema.Types.ObjectId,
    ref: 'Thread',
    required: true
  }
})
ReplySchema.statics.getReplies = function (thread, limit) {
  return this.find({ thread }).sort({ date: -1 }).limit(parseInt(limit))
}

const Thread = mongoose.model('Thread', ThreadSchema)
const Reply = mongoose.model('Reply', ReplySchema)

module.exports = {
  Thread,
  Reply
}
