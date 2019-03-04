var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user.js')
const nodemailer = require('nodemailer')
const templates = require('../templates/template')

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

router.post('/register', (req, res) => {
  //var eMailToRegister = req.body.eMail;
  debugger
  var mail = require('../nodeMailerWithTemp');
  debugger
  mail.sendPasswordReset('hahne.robin@gmail.com', 'Bobbie','Bob','http://localhost:3000/users')
})

router.post('/send-email', (req, res, next) => {
  debugger
  let { email } = req.body;
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
    html: templates.templateExample()
  })
  .then(info => {
    res.render('users/message', { email })
    console.log(info)
  })
  .catch(error => console.log(error))
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
          req.session.currentUser = foundUser.eMail;
          req.session.save();
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
      res.render('users/edit', {loggedUser})
    })
  }else{
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



/*
router.post('/:id/editPassword', (req, res) => {
  var newPassword = req.body.newPassword;
  var newPassword2 = req.body.newPassword2;
  var oldPassword = req.body.oldPassword;

  User.findById(req.params.id)
  .then((userById) => {
    bcrypt.compare(req.body.oldPassword, userById.password, function (err, result) {
      if (result == true) {
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
      } else {
        res.send('password doesnt match!');
      }
    });
  })
  .catch((err) => {
    res.send(err);
  })
})
*/
module.exports = router;
