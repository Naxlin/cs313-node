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

function getShows() {
	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
    		var res = JSON.parse(this.responseText);
    		if (res.shows != 'failed') {
    			getId('showsEdit').innerHTML = '';
				res.shows.forEach(function (item) {
    				getId('showsEdit').innerHTML += '<option value="0" selected>New Show</option>' +
    					'<option value="' + item.showid + '">' + item.showname + '</option>';
    			})
    		}
    	}
    };
    xhttp.open("GET", "project2/getShows", true);
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

	console.log(request);

	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
    		console.log(this.responseText);
    		var res = JSON.parse(this.responseText);
			goTo('yourlist');
    	}
    };
    xhttp.open("POST", "project2/addShow", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(request));
}

function updateShow() {
	// body...
}

// Toggle between updateShow and addShow
function toggleShowAddorUpdate(id) {
	var select = getId(id);

	if (select.options[select.selectedIndex].value == 0) {
		getId('updateShow').style.display = "none";
		getId('addShow').style.display = "inline-block";
	} else {
		getId('updateShow').style.display = "inline-block";
		getId('addShow').style.display = "none";		
	}
}