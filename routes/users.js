var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user.js')

/* GET users listing. */
router.get('/', function(req, res, next) {
  debugger
  res.render('users/index', {logged: req.session});
});

router.get('/signup', function(req, res, next) {
  res.render('users/signup');
});

router.get('/login', function(req, res, next) {
  res.render('users/login');
});

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
    .then( (user) => {
      if (user){
        res.send("username already exists")
      } else {
        User.create(newUser, (err) => {
          if (err) console.log(err)
          else {
            console.log('user registered')
            res.render('index', {logged: req.session})
          }
        })
      }
    })
  });
})

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
          res.redirect('/users', {logged: req.session})
        } else {
          res.send('password incorrect!');
        }
      });
    }
  })
});

router.get('/logout', function (req, res) {
  req.session.destroy();
  res.render('/');
})

router.get('/:userId', function (req, res) {
  req.session.destroy();
  res.render('/');
})

module.exports = router;
