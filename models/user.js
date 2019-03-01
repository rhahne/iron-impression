const mongoose = require('mongoose');
const Schema = mongoose.Schema

// Create Model 'User'
const User = mongoose.model('User', new Schema({
  firstName: String,
  lastName: String,
 // eMail: mongoose.SchemaTypes.Email,
  eMail: String,
  password: String,
  points: Number
}));

module.exports = User