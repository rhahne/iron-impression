var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user.js')
const Register = require('../models/register.js')
const nodemailer = require('nodemailer')
const templates = require('../templates/template')
var jwt = require('jsonwebtoken');


let transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'ironimpressioner@gmail.com',
    pass: 'alwayshalffull'
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
          res.redirect('/community/home')
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
    }, 'sloth')
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
                      res.render('users/message', {
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
      avatarNumber: Math.floor(Math.random() * 50) + 1  
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
          User.create(newUser, (err) => {
            if (err) console.log(err)
            else {
              Register.remove({
                eMail: req.body.eMail
              }, (err) => {
                if (err) {
                  res.send('something went wrong!')
                } else {
                  console.log('user registered')
                  req.session.currentUser = newUser.eMail;
                  req.session.currentUserId = newUser.id;
                  req.session.save();
                  res.redirect('/community/home')
                }
              });
            }
          })
        }
      })
  });
})

// Individual Profile Page
router.get('/profile', function (req, res, next) {
  if (req.session.currentUser) {
    User.findOne({
        eMail: req.session.currentUser
      })
      .then((loggedUser) => {
        res.render('users/profile', {
          loggedUser
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
  var email = req.body.email;
  if (email) {
    var emailHash = jwt.sign({
      eMail: 'hahne.robin@gmail.com'
    }, 'sloth');
    transporter.sendMail({
      from: '"Iron Impression 👻" <ironimpressioner@gmail.com>',
      to: email,
      subject: 'Reset password',
      html: templates.resetPassword(emailHash)
    })
    res.send('email sent');
  } else {
    res.send('no email set')
  }
})
router.get('/resetPassword', (req, res) => {
  if(!emailHash){
    var emailHash = req.query.emailHash;
  }
  var email = jwt.verify(emailHash, 'sloth');
  res.render('users/resetPassword', {
    email,
    emailHash
  })
})
router.post('/resetPassword', (req, res) => {
  var email = jwt.verify(req.query.emailHash, 'sloth');
  if (req.body.password === req.body.password2) {
    bcrypt.hash(req.body.password, 10, function (err, hash) {
      User.findOneAndUpdate({
          eMail: email.eMail
        }, {
          password: hash
        }, {new: true})
        .then((updatedUser) => {
          res.render('users/login', {passwordUpdated: true});
          //res.send("password is now updated!")
        })
    })
  } else {
    res.render('users/resetPassword', {
      errorMessage: "passwords are not equal!", emailHash: req.query.emailHash
    });
  }

})

module.exports = router;