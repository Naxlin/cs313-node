// This is the module for solo01 assignment:

// These lines make a router that can be exported to index.js for routing.
var express = require('express');
var router = express.Router();

//global vars
var services = [
	'NULL',
	'Letters (Stamped)',
	'Letters (Metered)',
	'Large Envelopes (Flats)',
	'First-Class Package Service—Retail'
]

router.get('/solo01', function(req, res) {
	var header = 'Postal Form Page';
	var title = 'Postal Application';
	res.render('s1form', {header: header, title: title});
});

router.post('/postage', function(req, res) {
	params = {
		header: 'Postal Form Page',
		title: 'Postal Application',
		oz: req.body.oz,
		service: services[req.body.service],
	};

	if (req.body.service == '1') {
		if (parseInt(params.oz, 10) < 1) {
			params.price = '$0.55';
		} else if (parseInt(params.oz, 10) < 2) {
			params.price = '$0.70';
		} else if (parseInt(params.oz, 10) < 3) {
			params.price = '$0.85';
		} else if (parseInt(params.oz, 10) < 3.5) {
			params.price = '$1.00';
		} else if (parseInt(params.oz, 10) > 3.5) {
			params.price = 'Mail Item overweight for this Service.';
		} 
	} else if (req.body.service == '2') {
		if (parseInt(params.oz, 10) < 1) {
			params.price = '$0.50';
		} else if (parseInt(params.oz, 10) < 2) {
			params.price = '$0.65';
		} else if (parseInt(params.oz, 10) < 3) {
			params.price = '$0.80';
		} else if (parseInt(params.oz, 10) < 3.5) {
			params.price = '$0.95';
		} else if (parseInt(params.oz, 10) > 3.5) {
			params.price = 'Mail Item overweight for this Service.';
		} 
	} else if (req.body.service == '3') {
		if (parseInt(params.oz, 10) < 1) {
			params.price = '$1.00';
		} else if (parseInt(params.oz, 10) < 2) {
			params.price = '$1.15';
		} else if (parseInt(params.oz, 10) < 3) {
			params.price = '$1.30';
		} else if (parseInt(params.oz, 10) < 4) {
			params.price = '$1.45';
		} else if (parseInt(params.oz, 10) < 5) {
			params.price = '$1.60';
		} else if (parseInt(params.oz, 10) < 6) {
			params.price = '$1.75';
		} else if (parseInt(params.oz, 10) < 7) {
			params.price = '$1.90';
		} else if (parseInt(params.oz, 10) < 8) {
			params.price = '$2.05';
		} else if (parseInt(params.oz, 10) < 9) {
			params.price = '$2.20';
		} else if (parseInt(params.oz, 10) < 10) {
			params.price = '$2.35';
		} else if (parseInt(params.oz, 10) < 11) {
			params.price = '$2.50';
		} else if (parseInt(params.oz, 10) < 12) {
			params.price = '$2.65';
		} else if (parseInt(params.oz, 10) < 13) {
			params.price = '$2.80';
		} else if (parseInt(params.oz, 10) > 13) {
			params.price = 'Mail Item overweight for this Service.';
		} 
	// The stats for this were chosen from the Zone 1 & 2 column.
	} else if (req.body.service == '4') {
		if (parseInt(params.oz, 10) < 4) {
			params.price = '$3.66';
		} else if (parseInt(params.oz, 10) < 8) {
			params.price = '$4.39';
		} else if (parseInt(params.oz, 10) < 12) {
			params.price = '$5.19';
		} else if (parseInt(params.oz, 10) < 13) {
			params.price = '$5.71';
		} else if (parseInt(params.oz, 10) > 13) {
			params.price = 'Mail Item overweight for this Service.';
		} 
	}

	res.render('s1postage', params);
});

module.exports = router;

