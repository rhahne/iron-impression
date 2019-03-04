const mongoose = require('mongoose');
const Schema = mongoose.Schema
const User = require('../models/user')
const Comments = require('../models/comments')

// Resume Model
const Resume = mongoose.model('Resume', new Schema({
  path: String,
  originalName: String,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  feedbackTypes: Array,
  feedbackDescription: String,
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comments' }],
  points: Number
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
}));

module.exports = Resume