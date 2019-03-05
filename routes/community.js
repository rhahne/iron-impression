var express = require('express');
var router = express.Router();
const multer = require('multer');
const Resume = require('../models/resume')
const mongoose = require('mongoose')
const Comments = require('../models/comments')
const User = require('../models/user')


// -------------------- COMMUNITY HOME -------------------- //
router.get('/home', function(req, res, next) {
    res.render('community/index')
});


// -------------------- RESUME ROUTES -------------------- //
router.get('/resume', function(req, res, next) {
    Resume.find({})
    .then((resumes) => {
        res.render('community/resume/index', {resumes})
    })
    .catch(error => {
        console.log(error);
    })
});

// Resume Upload GET
router.get('/resume/upload', (req, res, next) => {
    res.render('community/resume/upload');
})

// Resume Upload POST
var upload = multer({ dest: './public/uploads/' });

router
.post('/resume/upload', upload.single('cv'), (req, res, next) => {
    debugger
    const cv = new Resume({
        path: `/uploads/${req.file.filename}`,
        title: req.body.title,
        originalName: req.file.originalname,
        user: req.session.currentUser,
        feedbackTypes: req.body.feedbacktype,
        feedbackDescription: req.body.feedbackdescription,
        comments: [],
        points: 0
    });

    cv.save((err) => {
        message = 'Your CV has been uploaded!'
        res.redirect('/community/resume');
    });
});

router.get('/resume/details/:id', (req, res, next) => {
    let id = mongoose.Types.ObjectId(req.params.id);
    Resume.find({_id: id})
    .then((resume) => {
        debugger
        res.render('community/resume/details', {resume: resume[0]})
    })
    .catch(error => {
        console.log(error);
    })
})


// ON HOLD ------- ON HOLD ------- ON HOLD ------- ON HOLD ------- //
// -------------------- ENDORSMENT ROUTES -------------------- //

router.get('/endorse', (req, res, next) => {
    res.render('community/endorse/index')
})

router.get('/endorse/upload', (req, res, next) => {
    res.render('community/endorse/upload')
})

module.exports = router;