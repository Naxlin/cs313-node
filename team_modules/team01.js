// This is the module for team assignments:

// These lines make a router that can be exported to index.js for routing.
var express = require('express');
var router = express.Router();

router.get('/mathform', function(req, res) {
	res.render('team01/form', {header: 'Math Form Page'});
});

router.post('/math', function(req, res) {
	params = {
		header: 'Math Page',
		first: req.body.first,
		math: req.body.math,
		second: req.body.second,
		total: eval(req.body.first + req.body.math + req.body.second)
	};

	console.log("Hello!");
	res.render('team01/math', params);
});

router.post('/math_service', function(req, res) {
	console.log(req.body);
	params = {
		first: req.body.first,
		math: req.body.math,
		second: req.body.second,
		total: eval(req.body.first + req.body.math + req.body.second)
	};
	console.log(params);
	res.write(JSON.stringify(params));
	res.end();
});

module.exports = router;