var express = require('express');
var router = express.Router();
const multer = require('multer');
const Resume = require('../models/resume')
const mongoose = require('mongoose')
const Comments = require('../models/comments')
const User = require('../models/user')
const fs = require('fs');

// -- CHECK AUTHORIZATION -- //
router.get('/*', (req, res, next) => {
    debugger
    if(res.locals.currentUser){
        next();
    }else{
        res.send('no-permission son!')
    }
});

// -------------------- COMMUNITY HOME -------------------- //
router.get('/home', function (req, res, next) {
    res.render('community/index')
});

// -------------------- RESUME ROUTES -------------------- //
router.get('/resume', function (req, res, next) {
    Resume
    .find({})
    .populate('user')
    .then((resumes) => {
        debugger
        res.render('community/resume/index', {
            resumes
        })
    })
    .catch(error => {
        console.log(error);
    })
});

router.get('/resume/show', (req, res) => {
    fs.readFileSync(req.query.path, (err, data) => {
       res.contentType("application/pdf");
       res.send(data);
    });
});

// Resume Upload GET
router.get('/resume/upload', (req, res, next) => {
    res.render('community/resume/upload');
})
// Resume Upload POST
var upload = multer({
    dest: './public/uploads/'
});

router.post('/resume/upload', upload.single('cv'), (req, res, next) => {
    const cv = new Resume({
        path: `/uploads/${req.file.filename}`,
        title: req.body.title,
        originalName: req.file.originalname,
        user: mongoose.Types.ObjectId(req.session.currentUserId),
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
        .find({
            resume: id
        })
        .populate('user')
        .then((comments) => {
            Resume
                .find({
                    _id: id
                })
                .exec((err, resume) => {
                    if (err) console.log(err)
                    comments.forEach((comment) => {
                        var myCom;
                        if (comment.user.id === res.locals.currentUser) {
                            myCom = true;
                        } else {
                            myCom = false;
                        }
                        comment.myComment = myCom;
                    })
                    User.findOne({
                            _id: res.locals.currentUser
                        })
                        .then((currentUser) => {
                            res.render('community/resume/details', {
                                resume: resume[0],
                                comments: comments,
                                loggedUser: res.locals.currentUser,
                                avatarNumber: currentUser.avatarNumber
                            })
                        })

                })
        })
})

router.post('/resume/details/:id/comment', (req, res, next) => {
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

router.get('/resume/edit/:id', (req, res, next) => {
    Resume.findOne({
            _id: req.params.id
        })
        .then((resumeToEdit) => {
            res.render('community/resume/edit', {
                resumeToEdit
            })
        })
        .catch((err) => {
            res.send(err)
        })
})
router.post('/resume/edit/:id', upload.single('cv'), (req, res, next) => {
    const updateCV = {
        title: req.body.title,
        feedbackTypes: req.body.feedbacktype,
        feedbackDescription: req.body.feedbackdescription,
    };
    if (req.file) {
        updateCV.path = `/uploads/${req.file.filename}`;
        updateCV.originalName = req.file.originalname;
    }
    Resume.findOneAndUpdate({
            _id: req.params.id
        }, updateCV, {
            new: true
        })
        .then((resume) => {
            res.redirect('/community/resume');
        })
        .catch((err) => {
            res.send(err);
        })
})

router.post('/resume/editComment/:commentId', (req, res) => {
    Comments.findOneAndUpdate({
            _id: req.params.commentId
        }, req.body, {
            new: true
        })
        .then((comment) => {
            res.redirect(`/community/resume/details/${comment.resume._id}`);
        })
        .catch((err) => {
            res.send(err);
        })
})

router.get('/resume/delete/:id', (req, res) => {
    Resume.findOneAndDelete({
        _id: req.params.id
    }, (err) => {
        if (err) console.log(err);
        else {
            res.redirect('/community/resume')
        }
    })
})

router.get('/resume/deleteComment/:commentId', (req, res) => {
    Comments.findOneAndDelete({
        _id: req.params.commentId
    }, (err) => {
        if (err) console.log(err);
        else {
            res.redirect(`/community/resume`)
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