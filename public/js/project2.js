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
    		if (res.success) {
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
    xhttp.open("POST", "project2/signin", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({user: user, pass: pass})); 
}

function signout() {
	getId('user').value = "";
	getId('pass').value = "";

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
    		console.log(this.responseText);
    		var res = JSON.parse(this.responseText);
    		if (res.success) {
    			var active = getClass('signin');
    			var inactive = getClass('signin-hidden');
    			getId('username').innerHTML = '<b>fake username</b>';
    			addClass(active, 'signin-hidden');
    			active.classList.remove('signin');
    			addClass(inactive, 'signin');
    			inactive.classList.remove('signin-hidden');
    			addClass(getId('signinError'), 'error-hidden');
    			goTo('popular');
    		}
    	}
    };
    xhttp.open("GET", "project2/signout", true);
    xhttp.send();
}


function signup(userAvailable = false) {
	var user = getId('newUser').value;
	var pass = getId('newPass').value;
	var conf = getId('passConf').value;

	// Hide the signin error
	addClass(getId('signinError'), 'error-hidden');

	// Validate the username
	if (validateUser(user) || userAvailable) {
		addClass(getId('signupErrorUser'), 'error-hidden');
		addClass(getId('signupErrorUsrTkn'), 'error-hidden');
	} else {
		getId('signupErrorUser').classList.remove('error-hidden');
		return
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

	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
    		console.log(this.responseText);
    		var res = JSON.parse(this.responseText);
			if (res.success) {
				var active = getClass('signin');
				var inactive = getClass('signin-hidden');
				getId('username').innerHTML = '<b>' + res.user + '</b>';
				addClass(active, 'signin-hidden');
				active.classList.remove('signin');
				addClass(inactive, 'signin');
				inactive.classList.remove('signin-hidden');
				addClass(getId('signinError'), 'error-hidden');
				goTo('yourlist');
			}
    	}
    };
    xhttp.open("POST", "project2/signup", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({user: user, pass: pass}));
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
    		if (res.success) {
    			signup(true);
    		} else {
    			addClass(getId('signupErrorUser'), 'error-hidden');
				getId('signupErrorUsrTkn').classList.remove('error-hidden');
    		}
    	}
    };
    xhttp.open("POST", "project2/userExists", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({user: user}));
    return false;
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
		getId('header').innerHTML = 'Add a TV Show to Your List!';		
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
    		if (res.success) {
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
    		if (res.success) {
    			toggleShowAddorUpdate(true, true);
				getId('showsEdit').innerHTML = '';
				res.shows.forEach(function (item) {
    				getId('showsEdit').innerHTML += '<td><button type="button" class="full" onclick="switch2Show(' + item.showid + ')">' + item.showname + '</button></td>';
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
			if (res.success) {
				addClass(getId('genreErrorAdd'), 'error-hidden');
				getId('newgenrelabel').style.display = 'inline-block';
				getId('newgenrelist').innerHTML += '<li><input type="' + 
						'checkbox" name="genres[]" checked value="' +
						res.insert + '"><label class="checklabel">' + 
						res.insert + '</label></li>';
				getId('newgenre').value = '';
			} else {
				if (res.insert == 'taken') {
					getId('genreErrorAdd').classList.remove('error-hidden');
				}
				if (res.insert == 'failed') {
					console.log("Error: Server couldn't insert genre.");
				}
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
	if (!request) {
		return // Don't continue, because the show isn't filled out enough.
	}
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
		return false;
	} else {
		getId('showname').classList.remove('error-border');
	}
	if (desc.value == '') {
		addClass(getId('showdesc'), 'error-border')
		return false;
	} else {
		getId('showdesc').classList.remove('error-border');
	}
	if (epis.value == '') {
		addClass(getId('episodes'), 'error-border')
		return false;
	} else {
		getId('episodes').classList.remove('error-border');
	}

	var request = {
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
	    		if (res.success) {
	    			fillFields(res.show, res.watched);
	    		}
	    	}
	    };

	    // var user = getId('username').children[0].innerHTML;
	    xhttp.open("GET", "project2/getShow?id=" + showid, true);
	    xhttp.send();

	    var xhttp = new XMLHttpRequest();
	    xhttp.onreadystatechange = function() {
	    	if (this.readyState == 4 && this.status == 200) {
	    		var res = JSON.parse(this.responseText);
	    		console.log(res);
	    		if (res.success) {
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
    		if (res.success) {
	    		var list = getId('popular-container');
				
				var tempList = '<table class="shows-list"><tbody>' + 
								  '<tr>' + 
								   '<th>Show Name</th>' + 
								   '<th>Episodes</th>' + 
								   '<th>Length</th>' + 
								   '<th>Total Time</th>' + 
								  '</tr>';

				var processed = 0;
	    		res.shows.forEach(function (show) {
	    			tempList += '<tr>' + 
	    							   '<td class="bold">' + show.showname + '</td>' +
	    							   '<td>' + show.episodes + '</td>' +
	    							   '<td>' + show.episodelength + ' min</td>' +
	    							   '<td>' + ((show.episodes * show.episodelength) / 60).toFixed(1) + ' hrs</td>' +
	    							  '</tr>';

	    			processed++;
	    			if (processed == res.shows.length) {
	    				list.innerHTML = tempList + '</tbody></table>';
	    			}
	    		});
    		}
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
			var tempList = '<table class="shows-list"><tbody>' + 
							'<tr>' + 
							 '<th>Show Name</th>' + 
							 '<th>Watched</th>' + 
							 '<th>Repeats</th>' + 
							 '<th>Length</th>' + 
							 '<th>Total Time</th>' + 
							 '<th>Remove</th>' + 
							'</tr>';

    		if (res.success && res.shows == null) {
    			tempList += "<tr>" +
    						 "<td>You've watched no shows.</td>" +
							 "<td></td><td></td><td></td><td></td><td></td>" + 
							"</tr>"
				list.innerHTML = tempList + '</tbody></table>';
			} else if (res.success) {
	    		var processed = 0;
	    		var repeat = 0;
	    		var epl = 0;
	    		res.shows.forEach(function (show) {
	    			repeat = show.repeated != null ? show.repeated : 0;
	    			epl = show.episodelength;
	    			tempList += '<tr>' + 
    						     '<td class="bold">' + show.showname + '</td>' +
    						     '<td>' + show.watched + '/' + show.episodes + '</td>' +
    						     '<td>' + repeat + '</td>' +
    						     '<td>' + epl + ' min</td>' +
    						     '<td>' + ((show.watched * epl + (epl * repeat)) / 60).toFixed(1) + ' hrs</td>' +
    						     '<td class="X"><button type="button" onclick="removeShow(' + show.showid + ')">X</button></td>' +
    						    '</tr>';
	    			processed++;
	    			if (processed == res.shows.length) {
	    				list.innerHTML = tempList + '</tbody></table>';
	    			}
	    		});
    		} else {
    			goTo('signup');
    			tempList += "<tr>" +
    						 "<td>You've watched no shows.</td>" +
							 "<td></td><td></td><td></td>" + 
							"</tr>"
				list.innerHTML = tempList + '</tbody></table>';
    		}
    	}
    };

    xhttp.open("GET", "project2/getYourlist", true);
    xhttp.send();
}

function removeShow(showid) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
    		console.log(this.responseText);
    		var res = JSON.parse(this.responseText);
    		if (res.success) {
    			getYourlist();
    		} else {
    			goTo('signup');
    		}
    	}
    };
    xhttp.open("GET", "project2/removeShow?id=" + showid, true);
    xhttp.send();
}

window.onload = getPopular;