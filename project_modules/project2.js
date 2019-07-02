// This is the module for project2:
require('dotenv').config();
const connectionString = process.env.DATABASE_URL
const { Pool } = require('pg');
const pool = new Pool({connectionString: connectionString});

// General requires
var crypto = require('crypto');

// These lines make a router that can be exported to index.js for routing.
var express = require('express');
var router = express.Router();

// Global vars (sessionId - is the temporary way I'm going to do session tracking.)
var sessionId = '';

router.get('/project2', function(req, res) {
	var header = 'Track Your TV Shows!';
	var title = 'TV Show Application';
	res.render('project2', {header: header, title: title});
});

router.get('/project2/signin', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	pool.query('SELECT username, password, salt FROM users where username = $1', [req.query.user], (err, resp) => {
		if (resp.rows[0] != undefined) {
			var hash = crypto.createHmac('sha512', resp.rows[0].salt);
			hash.update(req.query.pass);
			hash = hash.digest('hex');

			if (hash == resp.rows[0].password) {
				res.end(JSON.stringify({'user': req.query.user}));
				sessionId = req.query.user;
			} else {
				res.end(JSON.stringify({'user': 'invalid'}));
			}
		} else {
			res.end(JSON.stringify({'user': 'invalid'}));
		}
	});
});

router.post('/project2/signup', function(req, res) {
	res.setHeader('Content-Type', 'application/json');

	// Hash the password with a random salt
	var salt = crypto.randomBytes(16).toString('hex');
	var hash = crypto.createHmac('sha512', salt);
	hash.update(req.body.pass);
	hash = hash.digest('hex');

	// Put the username and password with its salt into the database
	pool.query('INSERT INTO users (username, password, salt) VALUES ($1, $2, $3)', [req.body.user, hash, salt], (err, resp) => {
		if (err) {
			console.log(err);
			res.end(JSON.stringify({'user': 'invalid'}));
		} else {
			res.end(JSON.stringify({'user': req.body.user}));
			sessionId = req.body.user;
		}
	});

});

router.get('/project2/userExists', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	pool.query('SELECT username FROM users where username = $1', [req.query.user], (err, resp) => {
		if (resp.rows[0] == undefined) {
			res.end(JSON.stringify({'user': req.query.user}));
		} else {
			res.end(JSON.stringify({'user': 'invalid'}));
		}
	});
});

router.get('/project2/getGenres', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	pool.query('SELECT genrename FROM genres ORDER BY genrename ASC', (err, resp) => {
		if (resp.rows[0] != undefined) {
			res.end(JSON.stringify({'genres': resp.rows}));
		} else {
			res.end(JSON.stringify({'genres': 'failed'}));
		}
	});
});

router.get('/project2/getShows', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	pool.query('SELECT showid, showname FROM shows ORDER BY genrename ASC', (err, resp) => {
		if (resp.rows[0] != undefined) {
			res.end(JSON.stringify({'shows': resp.rows}));
		} else {
			res.end(JSON.stringify({'shows': 'failed'}));
		}
	});
});

router.post('/project2/addGenre', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	pool.query('SELECT genrename FROM genres where genrename = $1', [req.body.genre], (err, resp) => {
		if (resp.rows[0] == undefined) {
			pool.query('INSERT INTO genres (genrename) VALUES ($1)', [req.body.genre], (err, resp) => {
				if (err) {
					console.log(err);
					res.end(JSON.stringify({'insert': 'failed'}));
				} else {
					res.end(JSON.stringify({'insert': req.body.genre}));
				}
			});
		} else {
			res.end(JSON.stringify({'insert': 'taken'}));
		}
	});
});

router.post('/project2/addShow', function(req, res) {
	res.setHeader('Content-Type', 'application/json');

	// Inserting the new show into shows
	var inputs = [
		req.body.show,
		req.body.desc,
		parseInt(req.body.episodes),
		req.body.img != '' ? parseInt(req.body.length) : 'noshow.png',
		req.body.length != '' ? parseInt(req.body.length) : 20,
		req.body.ongoing
	];
	var userid = 0;
	var showid = 0;
	console.log(inputs);
	// NOTE: I should change this to sync instead of async since these functions require each other's responses.
	pool.query('INSERT INTO shows (showname, showdesc, episodes, showimg, episodelength, ongoing) VALUES ($1, $2, $3, $4, $5, $6)', inputs, (err, resp) => {
		if (err) {
			console.log(err);
			res.end(JSON.stringify({'insert': 'failed'}));
		} else {
			console.log('Successful shows Insert.');
		}

		// Getting userid for watched table insert
		pool.query('SELECT userid FROM users WHERE username = $1', [req.body.user], (err, resp) => {
			if (err) {
				console.log(err);
				res.end(JSON.stringify({'insert': 'failed'}));
			} else {
				userid = resp.rows[0].userid;
				console.log("User ID: " + userid);
			}
			// Getting showid for watched and showgenres table inserts
			pool.query('SELECT showid FROM shows WHERE showname = $1', [req.body.show], (err, resp) => {
				if (err) {
					console.log(err);
					res.end(JSON.stringify({'insert': 'failed'}));
				} else {
					showid = resp.rows[0].showid;
					console.log("Show ID: " + showid);
				}

				// Inserting into watched
				inputs = [userid, showid, req.body.watched != '' ? req.body.watched : 0];
				pool.query('INSERT INTO watched (userid, showid, watched) VALUES ($1, $2, $3)', inputs, (err, resp) => {
					if (err) {
						console.log(err);
						res.end(JSON.stringify({'insert': 'failed'}));
					} else {
						console.log('Successful watched Insert.');
					}
				});
			});
		});

		// Getting genre ids for showgenres table insert
		var genreids = [];
		req.body.genres.forEach(function (genre) {
			pool.query('SELECT genreid FROM genres WHERE genrename = $1', [genre], (err, resp) => {
				if (err) {
					console.log(err);
					res.end(JSON.stringify({'insert': 'failed'}));
				} 

				// Inserting into showgenres
				// genreids.forEach(function (id) {
				inputs = [showid, resp.rows[0].genreid];
				pool.query('INSERT INTO showgenres (showid, genreid) VALUES ($1, $2)', inputs, (err, resp) => {
					if (err) {
						console.log(err);
						res.end(JSON.stringify({'insert': 'failed'}));
					} else {
						console.log('Successful showgenres Insert.');
					}
			    // });
				});
			});
		});
	});

	

	

	res.end(JSON.stringify({'insert': 'success'}));
});

module.exports = router;

