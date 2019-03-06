var express = require('express');
var router = express.Router();
const multer = require('multer');
const Resume = require('../models/resume')
const mongoose = require('mongoose')
const Comments = require('../models/comments')
const User = require('../models/user')
const fs = require('fs');

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

// router.get('/resume/test', (req, res) => {
//     var tempFile="/uploads/CurriculumVitae(2019)-BasWakker-v4.pdf";
//     fs.readFile(tempFile, (err, data) => {
//        res.contentType("application/pdf");
//        res.send(data);
//     });
// });

// Resume Upload GET
router.get('/resume/upload', (req, res, next) => {
    res.render('community/resume/upload');
})
// Resume Upload POST
var upload = multer({ dest: './public/uploads/' });

router
.post('/resume/upload', upload.single('cv'), (req, res, next) => {
    const cv = new Resume({
        path:`/uploads/${req.file.filename}`,
        title: req.body.title,
        originalName: req.file.originalname,
        user: mongoose.Types.ObjectId(req.session.currentuserid),
        feedbackTypes: req.body.feedbacktype,
        feedbackDescription: req.body.feedbackdescription,
        points: 0
    });

    cv.save((err) => {
        message = 'Your CV has been uploaded!'
        res.redirect('/community/resume');
    });
});

router.get('/resume/details/:id', (req, res, next) => {
    let id = mongoose.Types.ObjectId(req.params.id);
    
    Comments
    .find({resume: id})
    .populate('user')
    .then((comments) => {
        Resume
        .find({_id: id})
        .exec((err, resume) => {
            
            if (err) console.log(err)
            res.render('community/resume/details', {resume: resume[0], comments: comments})
        })
    })
})

router.post('/resume/details/:id/comment', (req, res, next) => {
    debugger
    let user = mongoose.Types.ObjectId(req.session.currentUserId);
    let resume = mongoose.Types.ObjectId(req.params.id); 
    let text = req.body.text;
    let votes = req.body.votes;

    let comment = {
        user: user,
        resume: resume,
        text: text,
        votes: votes
    }
    Comments.create(comment, (err) => {

        if (err) {
            console.log(err)
        } else {
            res.redirect(`/community/resume/details/${req.params.id}`)
        }
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