const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', 'views');
// used to set a folder publicly accessable through /path/to/file
app.use(express.static('public'));
app.use(express.urlencoded());
app.use(express.json());

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/mathform', function(req, res) {
	res.render('nt1form', {header: 'Math Form Page'});
});

app.post('/math', function(req, res) {
	params = {
		header: 'Math Page',
		first: req.body.first,
		math: req.body.math,
		second: req.body.second,
		total: eval(req.body.first + req.body.math + req.body.second)
	};

	console.log("Hello!");
	res.render('nt1math', params);
});

app.post('/math_service', function(req, res) {
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

app.get('/test', function(req, res) {
	name = 'Jonathan';
	list = [
		{name:'thing1', weight:'20 lbs'},
		{name:'thing2', weight:'30 lbs'},
		{name:'thing3', weight:'25 lbs'}		
	];

	// the first is the file in the views folder, the second is a json of values to use in the file
	res.render('test', {name:name, list:list});
})

// instead of res.send() you can use the below to render a page.
// res.render('pages/about');
// pages like pages/about needs to be in a view folder.

// res.write('html to be rendered');

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// send a file from the server to the client. Needs to be in a res handler function.
// res.sendFile()


// Example request handling:
// app.get('/', function (req, res) {
//   res.send('Hello World!')
// })
// Respond to POST request on the root route (/), the application’s home page:

// app.post('/', function (req, res) {
//   res.send('Got a POST request')
// })
// Respond to a PUT request to the /user route:

// app.put('/user', function (req, res) {
//   res.send('Got a PUT request at /user')
// })
// Respond to a DELETE request to the /user route:

// app.delete('/user', function (req, res) {
//   res.send('Got a DELETE request at /user')
// })

// 404
// app.use(function (req, res, next) {
//   res.status(404).send("Sorry can't find that!")
// })

// 500
// app.use(function (err, req, res, next) {
//   console.error(err.stack)
//   res.status(500).send('Something broke!')
// })


// ARCHIVED REFERENCE CODE:

// MAKING FOLDER PUBLIC:
// used to set a folder publicly accessable through /path/to/file
// app.use(express.static('public'))
// used to change the prefix to the above.
// app.use('/static', express.static('public'))
// the absolute path to the folder:
// app.use('/static', express.static(path.join(__dirname, 'public')))
