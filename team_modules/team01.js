// This is the module for team01 assignment:

// These lines make a router that can be exported to index.js for routing.
var express = require('express');
var router = express.Router();

router.get('/team01', function(req, res) {
	var header = 'Math Form Page';
	var title = 'Math Application'
	res.render('t1form', {header: header, title: title});
});

router.post('/math', function(req, res) {
	params = {
		header: 'Math Page',
		title: 'Math Application',
		first: req.body.first,
		math: req.body.math,
		second: req.body.second,
		total: eval(req.body.first + req.body.math + req.body.second)
	};

	res.render('t1math', params);
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

