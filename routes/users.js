var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user.js')
const Register = require('../models/register.js')
const nodemailer = require('nodemailer')
const templates = require('../templates/template')

// Index Home
router.get('/', function (req, res, next) {
  res.render('/index', {
    user: req.session.currentUser
  });
});

// login
router.get('/login', function (req, res, next) {
  res.render('users/login');
});
router.post('/login', function (req, res) {
  User.findOne({
    eMail: req.body.eMail
  }).then(function (foundUser) {
    if (!foundUser) {
      res.send("incorrect username");
    } else {
      bcrypt.compare(req.body.password, foundUser.password, function (err, result) {
        if (result == true) {
          req.session.currentUser = foundUser.eMail;
          req.session.save();
          res.render('community/home')
        } else {
          res.send('password incorrect!');
        }
      });
    }
  })
});

// Register Button on /
router.post('/register', (req, res, next) => {
  bcrypt.hash(req.body.email, 10, function (err, hash) {
    newRegister = {
      eMail: req.body.email,
      eMailHash: hash
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
                  errorMessage: "register already exists"
                });
              } else {
                Register.create(newRegister, (err) => {
                  if (err) console.log(err)
                  else {
                    let {
                      email
                    } = req.body;
                    var emailHash = newRegister.eMailHash;
                    let transporter = nodemailer.createTransport({
                      service: 'Gmail',
                      auth: {
                        user: 'ironimpressioner@gmail.com',
                        pass: 'alwayshalffull'
                      }
                    });
                    transporter.sendMail({
                        from: '"Iron Impression 👻" <ironimpressioner@gmail.com>',
                        to: email,
                        subject: 'Iron Impression Get Access!',
                        html: templates.templateExample(emailHash)
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
});

// Link on E-Mail
router.get('/createAccount/:emailHash', (req, res) => {
  Register.findOne({
      eMailHash: req.params.emailHash
    })
    .then((foundRegister) => {
      if (foundRegister) {
        debugger
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
    newUser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: hash,
      eMail: req.body.eMail,
      points: 0
    }
    User.findOne({
        eMail: req.body.eMail
      })
      .then((user) => {
        if (user) {
          res.send("username already exists")
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
                  req.session.currentUser = foundUser.eMail;
                  req.session.save();
                  res.render('community/home')
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
  res.redirect('/users');
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

module.exports = router;