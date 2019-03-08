var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/about', function(req, res, next) {
  res.render('about');
});

router.get('/no-permission', function(req, res, next) {
  res.render('no-permission');
});

router.get('/playground', (req, res) => {
  var data = {
    designResumes: [1,2,3],
    grammarResumes: [4,5,6],
    allResumes: [1,2,3,4,5,6]
  }
  res.render('playground', {data, condition: true});
})

module.exports = router;