const mongoose = require('mongoose');
const Schema = mongoose.Schema

// Create Model 'Register'
const Register = mongoose.model('Register', new Schema({
  eMail: String,
  eMailSigned: String
}));

module.exports = Register