//PACKAGES
const express = require('express');
const app = express();
const db = require('./db');
let url = 'mongodb://localhost:27017/robots';
const handlebars = require('express-handlebars');
const robotRoutes = require('./routes/robots');

//BOILERPLATE

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
