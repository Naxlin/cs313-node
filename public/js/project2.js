// Global variables:
var selectedShowId = 0;

// Utility functions:
function getId(id) {
	return document.getElementById(id);
}

function getName(name) {
	return document.getElementsByName(name);
}

function getClass(cls) {
	return document.querySelector('.' + cls);
}

function addClass(ele, cls) {
	if (!ele.classList.contains(cls)) {
		ele.classList.add(cls);
	}
}

function getChecked(boxes) {
	var checked = [];
	boxes.forEach(function (box) {
		if (box.checked) {
			checked.push(box);
		}
	});
	return checked;
}

// Button functions:
function signin() {
	var user = getId('user').value;
	var pass = getId('pass').value;

	// Verifying required fields
	if (user == '') {
		addClass(getId('user'), 'error-border')
		return
	} else {
		getId('user').classList.remove('error-border');
	}
	if (pass == '') {
		addClass(getId('pass'), 'error-border');
		return
	} else {
		getId('pass').classList.remove('error-border');
	}

	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
    		console.log(this.responseText);
    		var res = JSON.parse(this.responseText);
    		if (res.user != 'invalid') {
    			var active = getClass('signin');
    			var inactive = getClass('signin-hidden');
    			getId('username').innerHTML = '<b>' + res.user + '</b>';
    			addClass(active, 'signin-hidden');
    			active.classList.remove('signin');
    			addClass(inactive, 'signin');
    			inactive.classList.remove('signin-hidden');
    			addClass(getId('signinError'), 'error-hidden');
    			goTo('yourlist');
    		} else {
				goTo('signup');
    			getId('signinError').classList.remove('error-hidden');
    		}
    	}
    };
    xhttp.open("GET", "project2/signin?user=" + user + "&pass=" + pass, true);
    xhttp.send(); 
}

function signup() {
	var user = getId('newUser').value;
	var pass = getId('newPass').value;
	var conf = getId('passConf').value;

	// Hide the signin error
	addClass(getId('signinError'), 'error-hidden');

	// Validate the username
	if (!validateUser(user)) {
		getId('signupErrorUser').classList.remove('error-hidden');
		return
	} else {
		addClass(getId('signupErrorUser'), 'error-hidden');
		addClass(getId('signupErrorUsrTkn'), 'error-hidden');
	}

	// Validate the password
	if (!validatePass(pass)) {
		getId('signupErrorPass').classList.remove('error-hidden');
		return
	} else {
		addClass(getId('signupErrorPass'), 'error-hidden');
	}

	// Compare password and confirmation for equality
	if (conf != pass) {
		getId('newPass').value = '';
		getId('passConf').value = '';
		getId('signupErrorDifPas').classList.remove('error-hidden');
		return
	} else {
		addClass(getId('signupErrorDifPas'), 'error-hidden');
	}

	var request = {user: user, pass: pass};

	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
    		console.log(this.responseText);
    		var res = JSON.parse(this.responseText);
			goTo('yourlist');
			var active = getClass('signin');
			var inactive = getClass('signin-hidden');
			getId('username').innerHTML = '<b>' + res.user + '</b>';
			addClass(active, 'signin-hidden');
			active.classList.remove('signin');
			addClass(inactive, 'signin');
			inactive.classList.remove('signin-hidden');
			addClass(getId('signinError'), 'error-hidden');
    	}
    };
    xhttp.open("POST", "project2/signup", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(request));
}

// Signup validation functions:
function validatePass(pass) {
	if (pass.length < 8) {
		return false;
	} else if (!/\d/.test(pass)) {
		// This check is for if the password contains a number.
		return false;
	} 
	return true;
}

function validateUser(user) {
	if (user.length < 4) {
		return false;
	} 

	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
    		console.log(this.responseText);
    		var res = JSON.parse(this.responseText);
    		if (res.user == 'invalid') {
    			addClass(getId('signupErrorUser'), 'error-hidden');
				getId('signupErrorUsrTkn').classList.remove('error-hidden');
    		}
    	}
    };
    xhttp.open("GET", "project2/userExists?user=" + user, true);
    xhttp.send();

    return true;
}

// Navigation function:
function goTo(page) {
	var active = getClass('page-container');
	var newActive = getId(page);
	addClass(active, 'page-container-hidden');
	active.classList.remove('page-container');
	addClass(newActive, 'page-container');
	newActive.classList.remove('page-container-hidden');

	if (page == 'yourlist') {
		getId('header').innerHTML = 'TV Shows You\'ve Watched!';
		getYourlist();
	} else if (page == 'signup') {
		getId('header').innerHTML = 'Create an Account!';		
	} else if (page == 'tvshow') {
		getGenres();
		getShows();
	}
}

// TVshow page population functions:
function getGenres() {
	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
    		var res = JSON.parse(this.responseText);
    		if (res.genres != 'failed') {
    			getId('genrelist').innerHTML = '';
				getId('newgenrelabel').style.display = 'none';
				getId('newgenrelist').innerHTML = '';
				res.genres.forEach(function (item) {
    				getId('genrelist').innerHTML += '<li><input type="' + 
						'checkbox" name="genres[]" value="' +
						item.genrename + '"><label class="checklabel">' + 
						item.genrename + '</label></li>';
						
    			})
    		}
    	}
    };
    xhttp.open("GET", "project2/getGenres", true);
    xhttp.send();
}

function getShows(show = 'allShows') {
	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
    		var res = JSON.parse(this.responseText);
    		if (res.shows != 'failed') {
    			toggleShowAddorUpdate(true, true);
				getId('showsEdit').innerHTML = '';
				res.shows.forEach(function (item) {
    				getId('showsEdit').innerHTML += '<li><button type="button" onclick="switch2Show(' + item.showid + ')">' + item.showname + '</button></li><br>';
    			})
    		} else {
    			toggleShowAddorUpdate(false, false);
    		}
    	}
    };
    xhttp.open("GET", "project2/getShows?show=" + show, true);
    xhttp.send();
}

// Button functions:
function addGenre() {
	var genre = getId('newgenre').value;

	var request = {genre: genre};

	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
    		console.log(this.responseText);
    		var res = JSON.parse(this.responseText);
			if (res.insert == 'failed') {
				console.log("Error: Server couldn't insert genre.");
			} else if (res.insert == 'taken') {
				getId('genreErrorAdd').classList.remove('error-hidden');
			} else {
				addClass(getId('genreErrorAdd'), 'error-hidden');
				getId('newgenrelabel').style.display = 'inline-block';
				getId('newgenrelist').innerHTML += '<li><input type="' + 
						'checkbox" name="genres[]" checked value="' +
						res.insert + '"><label class="checklabel">' + 
						res.insert + '</label></li>';
				getId('newgenre').value = '';
			}
    	}
    };
    xhttp.open("POST", "project2/addGenre", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(request));
}

function addShow() {
	console.log("Add Show");
	var request = getDOMShowVars();

	console.log(request);

	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
    		console.log(this.responseText);
    		var res = JSON.parse(this.responseText);
			goTo('yourlist');
			clearFields();
    	}
    };
    xhttp.open("POST", "project2/addShow", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(request));
}

// Updates the show with the new values when the "Update Show" button is clicked.
function updateShow() {
	console.log("Update Show");
	var request = getDOMShowVars();
	request.showid = selectedShowId;

	console.log(request);

	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
    		console.log(this.responseText);
    		var res = JSON.parse(this.responseText);
			goTo('yourlist');
			toggleShowAddorUpdate(true, true);
			clearFields();
    	}
    };
    xhttp.open("POST", "project2/updateShow", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(request));
}

function getDOMShowVars() {
	var show = getId('showname');
	var desc = getId('showdesc');
	var img = getId('showimg');
	var epis = getId('episodes');
	var wchd = getId('watched');
	var leng = getId('length');
	var ongo = getId('ongoing');
	var genres = [];
	var checked = getChecked(getName('genres[]'));
	checked.forEach(function (item) {
		genres.push(item.value);
	});

	// Verifying required fields
	if (show.value == '') {
		addClass(getId('showname'), 'error-border')
		return
	} else {
		getId('showname').classList.remove('error-border');
	}
	if (desc.value == '') {
		addClass(getId('showdesc'), 'error-border')
		return
	} else {
		getId('showdesc').classList.remove('error-border');
	}
	if (epis.value == '') {
		addClass(getId('episodes'), 'error-border')
		return
	} else {
		getId('episodes').classList.remove('error-border');
	}

	var request = {
		user: getId('username').children[0].innerHTML,
		show: show.value, 
		desc: desc.value,
		img: img.value,
		episodes: epis.value,
		watched: wchd.value,
		length: leng.value,
		ongoing: ongo.checked,
		genres: genres
	};

	return request;
}

// Toggle between updateShow and addShow
function toggleShowAddorUpdate(isNew, changeButtons) {
	if (isNew) {
		getId('showsEditContainer').style.display = 'inline-block';
		getId('newShowContainer').style.display = 'none';
		if (changeButtons) {
			getId('updateShow').style.display = "none";
			getId('addShow').style.display = "inline-block";
		}
	} else {
		getId('showsEditContainer').style.display = 'none';
		getId('newShowContainer').style.display = 'inline-block';
		if (changeButtons) {
			getId('updateShow').style.display = "inline-block";
			getId('addShow').style.display = "none";		
		}
	}
}

function switch2Show(showid) {
	if (showid == 0) {
		toggleShowAddorUpdate(true, true);
		clearFields();
	} else {
		toggleShowAddorUpdate(false, true);
		var xhttp = new XMLHttpRequest();
	    xhttp.onreadystatechange = function() {
	    	if (this.readyState == 4 && this.status == 200) {
	    		var res = JSON.parse(this.responseText);
	    		if (res.show != 'failed' && res.watched != undefined) {
	    			fillFields(res.show, res.watched);
	    		} else if (res.show != 'failed') {
	    			fillFields(res.show);
	    		}
	    	}
	    };

	    var user = getId('username').children[0].innerHTML;
	    xhttp.open("GET", "project2/getShow?id=" + showid + '&user=' + user, true);
	    xhttp.send();

	    var xhttp = new XMLHttpRequest();
	    xhttp.onreadystatechange = function() {
	    	if (this.readyState == 4 && this.status == 200) {
	    		var res = JSON.parse(this.responseText);
	    		console.log(res);
	    		if (res.genres != 'failed') {
	    			checkGenres(res.genres);
	    		}
	    	}
	    };

	    xhttp.open("GET", "project2/getShowGenres?id=" + showid, true);
	    xhttp.send();
	}
}

// Clears show fields
function clearFields() {
	getShows();
	getId('showname').value = '';
	getId('showdesc').value = '';
	getId('showimg').value = '';
	getId('episodes').value = '';
	getId('watched').value = '';
	getId('length').value = '';
	getId('ongoing').selected = false;
	getGenres();
}

// Fills show fields
function fillFields(show, watched = {watched: ''}) {
	selectedShowId = show.showid
	getId('showname').value = show.showname;
	getId('showdesc').value = show.showdesc;
	getId('showimg').value = show.showimg;
	getId('episodes').value = show.episodes;
	getId('watched').value = watched.watched;
	getId('length').value = show.episodelength;
	getId('ongoing').checked = show.ongoing;
}

// Checks the genre fields
function checkGenres(genres) {
	genres.forEach(function (genre) {
		console.log(genre);
		document.querySelector("input[type='checkbox'][value='" + genre + "']").checked = true;
	})
}

// Get the list of all shows
function getPopular() {
	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
    		var res = JSON.parse(this.responseText);
    		console.log(res);
    		var list = getId('popular-container');
			list.innerHTML = '';
    		res.shows.forEach(function (show) {
    			list.innerHTML += '<li><span class="bold">' + show.showname +
    							  ': </span> <span>Episodes - ' + show.episodes + 
    							  '</span> <span>Episode Length - ' + show.episodelength +
    							  ' min</span></li>';
    		});
    	}
    };

    xhttp.open("GET", "project2/getPopular", true);
    xhttp.send();
}

// Get the list for the username
function getYourlist() {
	var user = getId('username').children[0].innerHTML;

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
    		var res = JSON.parse(this.responseText);
    		console.log(res);
    		var list = getId('yourlist-container');
			list.innerHTML = '';
    		res.shows.forEach(function (show) {
    			list.innerHTML += '<li><span class="bold">' + show.showname +
    							  ': </span> <span>Episodes watched - ' + show.watched +
    							  '/' + show.episodes + '</span> <span>Repeats - ' + 
    							  show.repeated + '</span> <span>Episode Length - ' + 
    							  show.episodelength + ' min</span></li>';
    		});
    	}
    };

    xhttp.open("GET", "project2/getYourlist?user=" + user, true);
    xhttp.send();
}

window.onload = getPopular;