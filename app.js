const createError = require('http-errors');
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session    = require("express-session");
const MongoStore = require("connect-mongo")(session);
require("dotenv").config();

const app = express();

// connect to mongoDB
const mongoose = require('mongoose');
// process.env.DB_HOST
// in .env:
// DB_HOST=lalalalala
mongoose
  .connect(process.env.DB_HOST, {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
});

// init sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 999999999, expires: 999999999 },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  })
}));

app.use(function(req,res,next){
  res.locals.currentUser = req.session.currentUserId
  next()
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + "/views/partials")
hbs.registerHelper('ifCond', function(v1, v2, options) {
  if(v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var communityRouter = require('./routes/community')

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/community', communityRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;

