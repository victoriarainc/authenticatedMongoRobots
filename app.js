//PACKAGES
const express = require('express');
const app = express();


const db = require('./db');
let url = 'mongodb://localhost:27017/robots';


const handlebars = require('express-handlebars');


const robotRoutes = require('./routes/robots');

const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

// Auto-generates a "salt" -- a random string added to the password.
// const hash = bcrypt.hashSync(password, 8);



//BOILERPLATE

// for bcrypt
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, lowercase: true, required: true },
  passwordHash: { type: String, required: true }
});

userSchema.methods.setPassword = function (password) {
		  const hash = bcrypt.hashSync(password, 8);
		  this.passwordHash = hash;
		}

const User = mongoose.model('User', userSchema);

userSchema.virtual('password')
  .get(function () { return null })
  .set(function (value) {
    const hash = bcrypt.hashSync(value, 8);
    this.passwordHash = hash;
  })

userSchema.methods.authenticate = function (password) {
  return bcrypt.compareSync(password, this.passwordHash);
}

userSchema.statics.authenticate = function(username, password, done) {
    this.findOne({
        username: username
    }, function(err, user) {
        if (err) {
            done(err, false)
        } else if (user && user.authenticate(password)) {
            done(null, user)
        } else {
            done(null, false)
        }
    })
};

//for handlebars-express
app.engine('handlebars', handlebars());
app.set('views', './views');
app.set('view engine', 'handlebars');

//for express
app.use(express.static('public'));

//ROUTES
app.use('/', robotRoutes);

//APP
db.connect(url, (err, connection) => {
  if (!err)
    console.log('connected to mongo');

  //LISTEN
  app.listen(3000, function() {
    console.log('You started the application!');
  })
})
