// This is the module for team02 assignment:
require('dotenv').config();
const connectionString = process.env.DATABASE_URL
const { Pool } = require('pg');
const pool = new Pool({connectionString: connectionString});

// These lines make a router that can be exported to index.js for routing.
var express = require('express');
var router = express.Router();

router.get('/team02', function(req, res) {
	var header = 'Family History Page';
	var title = 'Family Application';
	res.render('t2', {header: header, title: title});
});

router.get('/getPerson', function(req, res) {
	pool.query('SELECT * FROM person where personid = $1', [req.query.personid], (err, resp) => {
	  res.setHeader('Content-Type', 'application/json');
	  res.end(JSON.stringify({'getPerson': resp.rows}));
	})
});

router.get('/getParents', function(req, res) {
	pool.query('SELECT personid, personFirstName, personLastName, dob FROM person INNER JOIN parents ON personid = father AND child = $1 OR personid = mother AND child = $1;', [req.query.personid], (err, resp) => {
	  res.setHeader('Content-Type', 'application/json');
	  res.end(JSON.stringify({'getParents': resp.rows}));
	})
});

router.get('/getChildren', function(req, res) {
	pool.query('SELECT personid, personFirstName, personLastName, dob FROM person INNER JOIN parents ON personid = child AND father = $1 OR personid = child AND mother = $1;', [req.query.personid], (err, resp) => {
	  res.setHeader('Content-Type', 'application/json');
	  res.end(JSON.stringify({'getChildren': resp.rows}));
	})
});

module.exports = router;

