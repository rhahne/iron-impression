var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user.js')
const Register = require('../models/register.js')
const nodemailer = require('nodemailer')
const templates = require('../templates/template')
var jwt = require('jsonwebtoken');
const Comments = require('../models/comments')
const Resume = require('../models/resume')
const mongoose = require('mongoose')

let transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.SEND_MAIL_ACCOUNT,
    pass: process.env.SEND_MAIL_PASSWORD
  }
});

// Index Home
router.get('/', (req, res, next) => {
  res.render('/index', {
    user: req.session.currentUser
  });
});

// login
router.get('/login', (req, res, next) => {
  res.render('users/login');
});
router.post('/login', (req, res) => {
  User.findOne({
    eMail: req.body.eMail
  }).then((foundUser) => {
    debugger
    if (!foundUser) {
      res.render('users/login', {
        errorMessage: 'E-Mail is not registered!'
      });
    } else {
      bcrypt.compare(req.body.password, foundUser.password, (err, result) => {
        if (result == true) {
          req.session.currentUser = foundUser.eMail;
          req.session.currentUserId = foundUser.id;
          req.session.save();
          res.redirect('/about')
        } else {
          res.render('users/login', {
            passwordReset: true
          });
        }
      });
    }
  })
});

// Register Button on /
router.post('/register', (req, res, next) => {
  newRegister = {
    eMail: req.body.email,
    eMailSigned: jwt.sign({
      eMail: req.body.email
    }, process.env.JWT_SECRET)
  }
  User.findOne({
      eMail: req.body.email
    })
    .then((user) => {
      if (user) {
        res.render("index", {
          errorMessage: "email already exists"
        });
      } else {
        Register.findOne({
            eMail: req.body.email
          })
          .then((register) => {
            if (register) {
              res.render("index", {
                errorMessage: "E-Mail already registered, check your E-Mail!"
              });
            } else {
              Register.create(newRegister, (err) => {
                if (err) console.log(err)
                else {
                  let {
                    email
                  } = req.body;
                  var emailHash = newRegister.eMailSigned;
                  transporter.sendMail({
                      from: '"Iron Impression 👻" <ironimpressioner@gmail.com>',
                      to: email,
                      subject: 'Iron Impression Get Access!',
                      html: templates.register(emailHash)
                    })
                    .then(info => {
                      console.log('email registered')
                      res.render('users/message', {signupMessage: true}, {
                        email
                      })
                      console.log(info)
                    })
                    .catch(error => console.log(error))
                }
              })
            }
          })
      }
    })
});

// Link on E-Mail
router.get('/createAccount', (req, res) => {
  Register.findOne({
      eMailSigned: req.query.emailHash
    })
    .then((foundRegister) => {
      if (foundRegister) {
        res.render('users/register', {
          email: foundRegister._doc.eMail
        })
      } else {
        res.send('something went wrong!')
      }
    })
})

// Sign Up new User
router.post('/signup', (req, res) => {
  bcrypt.hash(req.body.password, 10, function (err, hash) {
    bootcampString = `${req.body.bootcamp} ${req.body.location} ${req.body.month}, ${req.body.year}`
    newUser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      eMail: req.body.eMail,
      bootcamp: bootcampString,
      password: hash,
      bio: req.body.bio,
      linkedin: req.body.linkedin,
      points: 0,
      avatarNumber: Math.floor(Math.random() * 50) + 1,
      likedResumes: []
    }
    User.findOne({
        eMail: req.body.eMail
      })
      .then((user) => {
        if (user) {
          res.render("signup", {
            errorMessage: "email already exists"
          });
        } else {
          User.create(newUser)
            .then((createdUser) => {
              Register.remove({
                eMail: req.body.eMail
              }, (err) => {
                if (err) {
                  res.send('something went wrong!')
                } else {
                  console.log('user registered')
                  req.session.currentUser = createdUser.eMail;
                  req.session.currentUserId = createdUser.id;
                  req.session.save();
                  debugger
                  res.redirect('/about')
                }
              });
            })
            .catch((err) => {
              console.log(err)
            })
        }
      })
  });
})

// Individual Profile Page
router.get('/profile/:userId', function (req, res, next) {
  if (req.session.currentUser) {
    User
      .findOne({
        _id: req.params.userId
      })
      .populate('likedResumes')
      .then((loggedUser) => {
        let profileid = mongoose.Types.ObjectId(loggedUser.id);
        Comments
          .find({
            user: profileid
          })
          .populate({path: 'resume', populate: {path: 'user'}})
          .then((comments) => {
            Resume
              .find({
                user: profileid
              })
              .exec((err, resume) => {
                if (err) console.log(err)
                res.render('users/profile', {
                  loggedUser,
                  resume,
                  comments
                })
              })
          })
      })
  } else {
    res.send('no session')
  }
})

// Click on Logout Button
router.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
})

// Edit User information
router.get('/edit', function (req, res) {
  if (req.session.currentUser) {
    User.findOne({
        eMail: req.session.currentUser
      })
      .then((loggedUser) => {
        res.render('users/edit', {
          loggedUser
        })
      })
  } else {
    res.send('no session')
  }
})
router.post('/:id/edit', (req, res) => {
  User.findOneAndUpdate({
      _id: req.params.id
    }, req.body, {
      new: true
    })
    .then((loggedUser) => {
      res.render('users/profile', {
        loggedUser
      })
    })
    .catch((err) => {
      res.send(err);
    })
})

// reset Password
router.get('/reset', (req, res) => {
  res.render('users/reset')
})
router.post('/reset', (req, res, next) => {
  if (req.query.emailHash) {
    next();
  }
  var email = req.body.eMail;
  if (email) {
    var emailHash = jwt.sign({
      eMail: email
    }, process.env.JWT_SECRET);
    transporter.sendMail({
      from: '"Iron Impression 👻" <ironimpressioner@gmail.com>',
      to: email,
      subject: 'Reset password',
      html: templates.resetPassword(emailHash)
    })
    res.render('users/message', {resetPasswordMessage: true});
  } else {
    res.send('something went wrong!')
  }
})
router.get('/resetPassword', (req, res) => {
  if (!emailHash) {
    var emailHash = req.query.emailHash;
  }
  var email = jwt.verify(emailHash, process.env.JWT_SECRET);
  res.render('users/resetPassword', {
    email,
    emailHash
  })
})
router.post('/resetPassword', (req, res) => {
  var email = jwt.verify(req.query.emailHash, process.env.JWT_SECRET);
  if (req.body.password === req.body.password2) {
    bcrypt.hash(req.body.password, 10, function (err, hash) {
      User.findOneAndUpdate({
          eMail: email.eMail
        }, {
          password: hash
        }, {
          new: true
        })
        .then((updatedUser) => {
          res.render('users/login', {
            passwordUpdated: true
          });
          //res.send("password is now updated!")
        })
    })
  } else {
    res.render('users/resetPassword', {
      errorMessage: "passwords are not equal!",
      emailHash: req.query.emailHash
    });
  }

})

module.exports = router;