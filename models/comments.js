const mongoose = require('mongoose');
const Schema = mongoose.Schema
const User = require('../models/user')
const Resume = require('../models/resume')

// Comments Model
const Comments = mongoose.model('Comments', new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    resume: { type: Schema.Types.ObjectId, ref: 'Resume' },
    comment: String,
    likes: Number
  }));
  
  module.exports = Comments