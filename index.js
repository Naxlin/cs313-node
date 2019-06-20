// GENERAL REQUIRES
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// EXPRESS/EJS SETTINGS
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static('public'));
app.use(express.urlencoded());
app.use(express.json());

// TEAM MODULES:
app.use(require('./team_modules/team01.js'));
// app.use(require('./team_modules/team02.js'));

// SOLO MODULES:
// app.use(require('./solo_modules/solo01.js'));

// TEST OR GENERAL ROUTING:
// Root -> currently 'Hellow World!'
app.get('/', (req, res) => res.send('Hello World!'));
// test -> testing views and ejs logic
app.get('/test', function(req, res) {
	title = 'Test page title';
	header = 'Test page header';
	name = 'Jonathan';
	list = [{name:'thing1', weight:'20 lbs'},
					{name:'thing2', weight:'30 lbs'},
					{name:'thing3', weight:'25 lbs'}];

	res.render('test', {title:title, header:header, name:name, list:list});
})
// 500 - response for 500 errors
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})
// 404 - response for 404 errors
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
})

// STARTING SERVER!
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




// ARCHIVED REFERENCE CODE:

// MAKING FOLDER PUBLIC:
// used to set a folder publicly accessable through /path/to/file
// app.use(express.static('public'))
// used to change the prefix to the above.
// app.use('/static', express.static('public'))
// the absolute path to the folder:
// app.use('/static', express.static(path.join(__dirname, 'public')))
