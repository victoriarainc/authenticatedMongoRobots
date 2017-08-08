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
passport.use(
  new LocalStrategy(function(username, password, done) {
    console.log('LocalStrategy', username, password);
    User.authenticate(username, password)
      // success!!
      .then(user => {
        if (user) {
          done(null, user);
        } else {
          done(null, null, { message: 'There was no user with this email and password.' });
        }
      })
      // there was a problem
      .catch(err => done(err));
  })
);

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

// require the login
const requireLogin = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

app.get('/', requireLogin, (req, res) => {
  res.render('home', { user: req.user });
});

// local login form
app.get('/login', (req, res) => {
  res.render('loginForm', { failed: req.query.failed });
});

// endpoint for local login sumbit
app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login?failed=true',
    failureFlash: true
  })
);

app.get('/register', (req, res) => {
  res.render('registerForm');
});

app.post('/register', (req, res) => {
  let user = new User(req.body);
  user.provider = 'local';
  user.setPassword(req.body.password);

  user
    .save()
    // if good...
    .then(() => res.redirect('/'))
    // if bad...
    .catch(err => console.log(err));
});

// log out!!!!!
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// app.use('/', robotRoutes);
//
// app.get('/login/', function(req, res) {
//     res.render("login", {
//         messages: res.locals.getMessages()
//     });
// });
//
// app.post('/login/', passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login/',
//     failureFlash: true
// }))

//APP
db.connect(url, (err, connection) => {
  if (!err)
    console.log('connected to mongo');

  //LISTEN
  app.listen(3000, function() {
    console.log('You started the application!');
  })
})
