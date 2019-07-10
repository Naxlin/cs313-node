// This is the module for team02 assignment:
require('dotenv').config();
const connectionString = process.env.DATABASE_URL
const { Pool } = require('pg');
const pool = new Pool({connectionString: connectionString});

// These lines make a router that can be exported to index.js for routing.
var express = require('express');
var router = express.Router();

// General requires
var crypto = require('crypto');

router.get('/team04', function (req, res) {
	var header = 'API Log In';
	var title = 'API Log In';
	res.render('team04', {header: header, title: title});
});

// Logging into site:
router.post('/team04/login', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	pool.query('SELECT username, password, salt FROM users where username = $1', [req.body.user], (err, resp) => {
		if (resp.rows[0] != undefined) {
			var hash = crypto.createHmac('sha512', resp.rows[0].salt);
			hash.update(req.body.pass);
			hash = hash.digest('hex');

			if (hash == resp.rows[0].password) {
				req.session.user = req.body.user;
				res.end(JSON.stringify({'success': true}));
			} else {
				res.end(JSON.stringify({'success': false}));
			}
		} else {
			res.end(JSON.stringify({'success': false}));
		}
	});
});

// Putting a new user and their other credentials into the database
router.post('/team04/logout', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	if (req.session.user) {
		req.session.reset();
		res.end(JSON.stringify({'success': true}));
	} else {
		res.end(JSON.stringify({'success': false}));
	}
});

router.get('/team04/getServerTime', verifyLogin, function(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	console.log("Received a request for: " + req.url);
	
	var time = new Date();
	res.end(JSON.stringify({'success': true, 'time': time}));
});

function verifyLogin(req, res, next) {
	if (req.session.user) {
		next();
	} else {
		res.status(401).end(JSON.stringify({'success': false}));		
	}
}



module.exports = router;
