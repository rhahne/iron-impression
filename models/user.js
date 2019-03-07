const mongoose = require('mongoose');
const Schema = mongoose.Schema

// User Model
const User = mongoose.model('User', new Schema({
  firstName: String,
  lastName: String,
  eMail: String,
  bootcamp: String,
  bio: String,
  linkedin: String,
  password: String,
  points: Number,
  avatarNumber: Number,
  likedResumes: [{ type: Schema.Types.ObjectId, ref: 'Resume' }]
}));

module.exports = User