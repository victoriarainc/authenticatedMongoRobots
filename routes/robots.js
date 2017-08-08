const express = require('express');
const routes = express.Router();
const db = require('../db');

routes.get('/', (req, res) => {
  let coll = db.get().collection('robots');

  coll.find({}).toArray((err, robots) => {
    res.render('home', { users: robots });
  });
});

routes.get('/:userName', (req, res) => {
  let col = db.get().collection('robots');

  col.findOne({username: req.params.userName}, (err, robot) => {
    res.render('goof', robot);
  });
});

module.exports = routes;
