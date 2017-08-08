//PACKAGES
const express = require('express');
const app = express();
const db = require('./db');
let url = 'mongodb://localhost:27017/robots';
const handlebars = require('express-handlebars');
const robotRoutes = require('./routes/robots');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const flash = require('express-flash-messages');

//BOILERPLATE

// for passport
passport.use(new LocalStrategy(
    function(username, password, done) {
        User.authenticate(username, password, function(err, user) {
            if (err) {
                return done(err)
            }
            if (user) {
                return done(null, user)
            } else {
                return done(null, false, {
                    message: "There is no user with that username and password."
                })
            }
        })
    }));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

//for handlebars-express
app.engine('handlebars', handlebars());
app.set('views', './views');
app.set('view engine', 'handlebars');

//for express
app.use(express.static('public'));

//for session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
}));

//for passport
app.use(passport.initialize());

//for passport session
app.use(passport.session());

//for flash
app.use(flash());

//ROUTES
app.use('/', robotRoutes);

app.get('/login/', function(req, res) {
    res.render("login", {
        messages: res.locals.getMessages()
    });
});

app.post('/login/', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login/',
    failureFlash: true
}))

//APP
db.connect(url, (err, connection) => {
  if (!err)
    console.log('connected to mongo');

  //LISTEN
  app.listen(3000, function() {
    console.log('You started the application!');
  })
})
