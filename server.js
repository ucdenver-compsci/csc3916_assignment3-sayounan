/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const authController = require('./auth');
const authJwtController = require('./auth_jwt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./Users');
const Movie = require('./Movies');
const {response} = require("express");
const {save} = require("mocha/mocha");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

const router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    const json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        const user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code === 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    const userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                const userToken = {id: user.id, username: user.username};
                const token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

router.route('/movies')
    .get((req, res) => {
        const o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "GET Movies";
        res.status(200).json(o);
    })

    .post(async (req, res) => {
        const { title, releaseDate, genre, actors } = req.body;

        const newMovie = new Movie({
            title,
            releaseDate,
            genre,
            actors
        });

        try {
            await newMovie.save();
            const o = getJSONObjectForMovieRequirement(req);
            o.status = 201;
            o.message = 'Movie added successfully'
            res.status(201).json({o});
        } catch (error) {
            res.status(500).json({ message: 'Failed to add movie', error: error.message });
        }
    })

    .put(authJwtController.isAuthenticated, (req, res) => {
        const o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "Movie Updated";
        res.status(200).json(o);
    })

    .delete(authController.isAuthenticated, (req, res) => {
        const o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "movie deleted";
        res.json(o);
    })

    .all((req, res) => {
        res.status(405).json({success: false, msg: 'HTTP Method Not Allowed'});
    })


app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


