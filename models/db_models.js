const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ThreadSchema = new Schema({
  text: { type: String, required: true },
  board: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false, required: true },
  replyCount: { type: Number, default: 0, required: true },
  deletePassword: { type: String, required: true },
  replies: [
    { type: Schema.Types.ObjectId, ref: 'Reply', default: [], required: true }
  ],
})

ThreadSchema.statics.getThreads = function (board, limit) {
  return this.find({ board })
    .select('-deletePassword -reported')
    .sort({ date: -1 })
    .limit(parseInt(limit))
}

ThreadSchema.statics.getThreadWithReplies = function(id) {
  return this.findById( id )
  .select('-deletePassword -reported')
    .sort({ date: -1 })
    .populate('replies')

}

ThreadSchema.methods.withLatestReplies = function (limit) {
  const that = this
  return Reply.getReplies(that._id, 3).then(result => {
    that.replies = result
    return that
  })
}

ThreadSchema.methods.addReply = function (replyRef) {
  this.replies.push(replyRef)
  this.replyCount += 1
  return this.save()
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
  return this.find({ thread })
    .select('-deletePassword -reported')
    .sort({ date: -1 })
    .limit(parseInt(limit))
}

const Thread = mongoose.model('Thread', ThreadSchema)
const Reply = mongoose.model('Reply', ReplySchema)

module.exports = {
  Thread,
  Reply
}
