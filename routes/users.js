var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user.js')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users/index', {user: req.session.currentUser});
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
            res.render('index')
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
          debugger
          req.session.currentUser = foundUser.eMail;
          req.session.save();
          debugger
          res.redirect('/users')
        } else {
          res.send('password incorrect!');
        }
      });
    }
  })
});

router.get('/profile', function (req, res, next) {
  if(req.session.currentUser){
    User.findOne({
      eMail: req.session.currentUser
    })
    .then((loggedUser) => {
      debugger
      res.render('users/profile', {loggedUser})
    })
  }else{
    res.send('no session')
  }
})


router.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/users');
})

router.get('/edit', function (req, res) {
  if(req.session.currentUser){
    User.findOne({
      eMail: req.session.currentUser
    })
    .then((loggedUser) => {
      debugger
      res.render('users/edit', {loggedUser})
    })
  }else{
    res.send('no session')
  }
})


module.exports = router;
