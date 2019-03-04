const mongoose = require('mongoose');
const Schema = mongoose.Schema

// User Model
const User = mongoose.model('User', new Schema({
  firstName: String,
  lastName: String,
  eMail: String,
  eMailHash: String,
  password: String,
  points: Number
}));

module.exports = User