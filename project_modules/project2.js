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

// The root of the project, since this is a SPA this typically called once
router.get('/project2', function(req, res) {
	var header = 'Track Your TV Shows!';
	var title = 'TV Show Application';
	res.render('project2', {header: header, title: title});
});

// Confirming a signin against the database users
router.post('/project2/signin', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	pool.query('SELECT userid, username, password, salt FROM users where username = $1', [req.body.user], (err, resp) => {
		if (resp.rows[0] != undefined) {
			var hash = crypto.createHmac('sha512', resp.rows[0].salt);
			hash.update(req.body.pass);
			hash = hash.digest('hex');

			if (hash == resp.rows[0].password) {
				req.session.user = req.body.user;
				req.session.userid = resp.rows[0].userid;
				res.end(JSON.stringify({'success': true, 'user': req.body.user}));
			} else {
				res.end(JSON.stringify({'success': false}));
			}
		} else {
			res.end(JSON.stringify({'success': false}));
		}
	});
});

// Confirming a signin against the database users
router.get('/project2/signout', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	if (req.session.user) {
		req.session.reset();
		res.end(JSON.stringify({'success': true}));
	} else {
		res.end(JSON.stringify({'success': false}));
	}
});

// Putting a new user and their other credentials into the database
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
			res.end(JSON.stringify({'success': false}));
		} else {
			req.session.user = req.body.user;

			// Get the userid for the session variable.
			pool.query('SELECT userid FROM users WHERE username = $1', [req.body.user], (err, resp) => {
				req.session.userid = resp.rows[0].userid;
				res.end(JSON.stringify({'success': true, 'user': req.body.user}));
			});
		}
	});
});

// Checks if the user exists (making sure that duplicate users won't happen)
router.post('/project2/userExists', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	pool.query('SELECT username FROM users where username = $1', [req.body.user], (err, resp) => {
		if (resp.rows[0] == undefined) {
			res.end(JSON.stringify({'success': true, 'user': req.body.user}));
		} else {
			res.end(JSON.stringify({'success': false}));
		}
	});
});

// Gets all the genres
router.get('/project2/getGenres', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	pool.query('SELECT genrename FROM genres ORDER BY genrename ASC', (err, resp) => {
		if (resp.rows[0] != undefined) {
			res.end(JSON.stringify({'success': true, 'genres': resp.rows}));
		} else {
			res.end(JSON.stringify({'success': false}));
		}
	});
});

// Gets the shows that match the show param, or all of them if allShows is the show param
router.get('/project2/getShows', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	if (req.query.show == 'allShows') {
		pool.query('SELECT showid, showname FROM shows ORDER BY showname ASC', (err, resp) => {
			if (resp.rows[0] != undefined) {
				res.end(JSON.stringify({'shows': resp.rows}));
			} else {
				res.end(JSON.stringify({'shows': 'failed'}));
			}
		});		
	} else {
		pool.query('SELECT showid, showname FROM shows WHERE lower(showname) LIKE lower($1) ORDER BY showname ASC', ['%' + req.query.show + '%'], (err, resp) => {
			if (resp.rows[0] != undefined) {
				res.end(JSON.stringify({'shows': resp.rows}));
			} else {
				res.end(JSON.stringify({'shows': 'failed'}));
			}
		});
	}
});

// Gets the details of a specific show, and how many episodes you've watched.
router.get('/project2/getShow', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	var response = {'success': true};
	var show = false;
	var watched = false;
	pool.query('SELECT * FROM shows where showid = $1', [req.query.id], (err, resp) => {
		if (resp.rows[0] != undefined) {
			response.show = resp.rows[0];
		} else {
			res.end(JSON.stringify({'success': false}));
		}
		show = true;
		if (show && watched) {
			res.end(JSON.stringify(response));
		}
	});

	if (req.session.userid) {
		pool.query('SELECT watched FROM watched where showid = $1 AND userid = $2', [req.query.id, req.session.userid], (err, resp) => {
			if (resp.rows[0] != undefined) {
				response.watched = resp.rows[0];
			} 
			watched = true;
			if (show && watched) {
				res.end(JSON.stringify(response));
			}
		});
	} else {
		response.watched = 0;

		watched = true;
		if (show && watched) {
			res.end(JSON.stringify(response));
		}
	}
});

router.get('/project2/getShowGenres', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	var genres = [];
	var genreids = [];

	pool.query('SELECT genreid FROM showgenres where showid = $1', [req.query.id], (err, resp) => {
		if (resp.rows[0] != undefined) {
			genreids = resp.rows;
		} 

		var processed = 0;
		genreids.forEach(function (item) {
			pool.query('SELECT genrename FROM genres where genreid = $1', [item.genreid], (err, resp) => {
				if (resp.rows[0] != undefined) {
					genres.push(resp.rows[0].genrename);
				} else {
					res.end(JSON.stringify({'genres': 'failed'}));
				}

				processed++;
				if (processed == genreids.length) {
					res.end(JSON.stringify({'genres': genres}));
				}
			});
		});
		
	});
});


// Adding a genre to the database only if it doesn't exist
router.post('/project2/addGenre', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	pool.query('SELECT genrename FROM genres where genrename = $1', [req.body.genre], (err, resp) => {
		if (resp.rows[0] == undefined) {
			pool.query('INSERT INTO genres (genrename) VALUES ($1)', [req.body.genre], (err, resp) => {
				if (err) {
					console.log(err);
					res.end(JSON.stringify({'success': false, 'insert': 'failed'}));
				} else {
					res.end(JSON.stringify({'success': true, 'insert': req.body.genre}));
				}
			});
		} else {
			res.end(JSON.stringify({'success': false, 'insert': 'taken'}));
		}
	});
});

// Adding a show to the database, and to the database list for the user who added it
// This is fairly complicated, because it has to put the show in, then populate the watched table
// for the user with the show, and attached the genres to the show.
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
	var showid = 0;
	var genres = false;
	var watched = false;
	console.log(inputs);
	// NOTE: I should change this to sync instead of async since these functions require each other's responses.
	pool.query('INSERT INTO shows (showname, showdesc, episodes, showimg, episodelength, ongoing) VALUES ($1, $2, $3, $4, $5, $6)', inputs, (err, resp) => {
		if (err) {
			console.log(err);
			res.end(JSON.stringify({'success': false}));
		} else {
			console.log('Successful shows Insert.');
		}

		// Getting userid for watched table insert
		if (req.session.userid) {
			console.log("User ID: " + req.session.userid);
			// Getting showid for watched and showgenres table inserts
			pool.query('SELECT showid FROM shows WHERE showname = $1', [req.body.show], (err, resp) => {
				if (err) {
					console.log(err);
					res.end(JSON.stringify({'success': false}));
				} else {
					showid = resp.rows[0].showid;
					console.log("Show ID: " + showid);
				}

				// Inserting into watched
				inputs = [req.session.userid, showid, req.body.watched != '' ? req.body.watched : 0];
				pool.query('INSERT INTO watched (userid, showid, watched) VALUES ($1, $2, $3)', inputs, (err, resp) => {
					if (err) {
						console.log(err);
						res.end(JSON.stringify({'success': false}));
					} else {
						console.log('Successful watched Insert.');
					}

					watched = true;
					if (watched && genres) {
						res.end(JSON.stringify({'success': true}));
					}
				});
			});
		} else {
			console.log('User not logged in, watched table not inserted.');
		}

		// Getting genre ids for showgenres table insert
		var genreids = [];
		var processed = 0;
		req.body.genres.forEach(function (genre) {
			pool.query('SELECT genreid FROM genres WHERE genrename = $1', [genre], (err, resp) => {
				if (err) {
					console.log(err);
					res.end(JSON.stringify({'success': false}));
				} 

				// Inserting into showgenres
				inputs = [showid, resp.rows[0].genreid];
				pool.query('INSERT INTO showgenres (showid, genreid) VALUES ($1, $2)', inputs, (err, resp) => {
					if (err) {
						console.log(err);
						res.end(JSON.stringify({'success': false}));
					} else {
						console.log('Successful showgenres Insert.');
					}

					genres = true;
					processed++;
					if (watched && genres && (processed == req.body.genres.length)) {
						res.end(JSON.stringify({'success': true}));
					}
				});
			});
		});
	});
});

// Updating a show in the database
router.post('/project2/updateShow', function(req, res) {
	res.setHeader('Content-Type', 'application/json');

	// Inserting the new show into shows
	var inputs = [
		req.body.show,
		req.body.desc,
		parseInt(req.body.episodes),
		req.body.img != '' ? parseInt(req.body.length) : 'noshow.png',
		req.body.length != '' ? parseInt(req.body.length) : 20,
		req.body.ongoing,
		req.body.showid
	];
	var userid = 0;
	console.log(inputs);
	// NOTE: I should change this to sync instead of async since these functions require each other's responses.
	pool.query('UPDATE shows SET showname = $1, showdesc = $2, episodes = $3, showimg = $4, episodelength = $5, ongoing = $6 WHERE showid = $7', inputs, (err, resp) => {
		if (err) {
			console.log(err);
			res.end(JSON.stringify({'update': 'failed'}));
		} else {
			console.log('Successful shows Update.');
		}

		// Getting userid for watched table update
		pool.query('SELECT userid FROM users WHERE username = $1', [req.session.user], (err, resp) => {
			if (err) {
				console.log(err);
				res.end(JSON.stringify({'update': 'failed'}));
			} else {
				userid = resp.rows[0].userid;
				console.log("User ID: " + userid);
			}
			// Inserting into watched by first checking if their is an entry. If no entry insert, else update.
			// inputs = [userid, req.body.showid, req.body.watched != '' ? req.body.watched : 0];
			pool.query('SELECT * FROM watched WHERE userid = $1 AND showid = $2', [userid, req.body.showid], (err, resp) => {
				if (err) {
					console.log(err);
					res.end(JSON.stringify({'update': 'failed'}));
				} else if (resp.rows[0] == undefined) {
					pool.query('INSERT INTO watched (userid, showid, watched) VALUES ($1, $2, $3)', [userid, req.body.showid, req.body.watched != '' ? req.body.watched : 0], (err, resp) => {
						if (err) {
							console.log(err);
							res.end(JSON.stringify({'update': 'failed'}));
						} else {
							console.log('Successful watched Insert.');
						}
					});
				} else {
					pool.query('UPDATE watched SET userid = $1, showid = $2, watched = $3 WHERE userid = $1 AND showid = $2', [userid, req.body.showid, req.body.watched != '' ? req.body.watched : 0], (err, resp) => {
						if (err) {
							console.log(err);
							res.end(JSON.stringify({'update': 'failed'}));
						} else {
							console.log('Successful watched Insert.');
						}
					});
					console.log('Successful watched Update.');
				}
			});
		});

		// Removing all associated genres, then getting genre ids for showgenres table update and updating the table with the new list
		var genreids = [];
		pool.query('DELETE FROM showgenres WHERE showid = $1', [req.body.showid], (err, resp) => {
			req.body.genres.forEach(function (genre) {
				pool.query('SELECT genreid FROM genres WHERE genrename = $1', [genre], (err, resp) => {
					if (err) {
						console.log(err);
						res.end(JSON.stringify({'update': 'failed'}));
					} else {
						console.log("Successful showgenre Update for: " + genre);
					}

					// Inserting into showgenres
					inputs = [req.body.showid, resp.rows[0].genreid];
					pool.query('INSERT INTO showgenres (showid, genreid) VALUES ($1, $2)', inputs, (err, resp) => {
						if (err) {
							console.log(err);
							res.end(JSON.stringify({'update': 'failed'}));
						} else {
							console.log('Successful showgenres Update.');
						}
					});
				});
			});
		});
	});

	res.end(JSON.stringify({'update': 'success'}));
});

// Gets all the list of popular shows (all shows for now)
router.get('/project2/getPopular', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	pool.query('SELECT showname, showimg, episodes, episodelength FROM shows ORDER BY showname ASC', (err, resp) => {
		if (resp.rows[0] != undefined) {
			res.end(JSON.stringify({'shows': resp.rows}));
		} else {
			res.end(JSON.stringify({'shows': 'failed'}));
		}
	});
});

// Gets all the list of your shows (sorted by name for now, rating later (or that might be an option))
// Also this is doing it by username, but should probably do it by a session variable, when we learn about those.
router.get('/project2/getYourlist', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	var userid = 0;
	var response = {'shows': []};
	// Getting userid for watched table update
	pool.query('SELECT userid FROM users WHERE username = $1', [req.query.user], (err, resp) => {
		if (err) {
			console.log(err);
			res.end(JSON.stringify({'yourlist': 'failed'}));
		} else {
			userid = resp.rows[0].userid;
			console.log("User ID: " + userid);
		}

		var watched = []
		pool.query('SELECT * FROM watched WHERE userid = $1', [userid], (err, resp) => {
			if (err) {
				console.log(err);
				res.end(JSON.stringify({'yourlist': 'failed'}));
			} else if (resp.rows[0] != undefined) {
				console.log("Successful watched query");
				watched = resp.rows;
			} else {
				console.log("Successful watched query - user has watched no shows.");
			}

			var processed = 0;
			watched.forEach(function (show) {
				pool.query('SELECT showname, showimg, episodes, episodelength FROM shows WHERE showid = $1 ORDER BY showname ASC', [show.showid], (err, resp) => {
					if (err) {
						console.log(err);
						res.end(JSON.stringify({'shows': 'failed'}));
					} else if (resp.rows[0] != undefined) {
						console.log("Successful shows query");
						response.shows.push({'showname': resp.rows[0].showname,
											 'showimg': resp.rows[0].showimg,
											 'episodes': resp.rows[0].episodes,
											 'episodelength': resp.rows[0].episodelength,
											 'watched': show.watched,
											 'repeated': show.repeated});
					} 
					
					processed++;
					if (processed == watched.length) {
						res.end(JSON.stringify(response));
					}
				});
			});
		});
	});
});

module.exports = router;

// NOTES:
// > I could combine getshowgenres with the other call, because of the discovered foreach completion check