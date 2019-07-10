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

function login() {
	var user = getId('t4username').value;
	var pass = getId('t4password').value;

	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
    		console.log(this.responseText);
    		var res = JSON.parse(this.responseText);
    		if (res.success == true) {
    			getId('t4status').innerHTML = "Successfully logged in.";
    		} else {
    			getId('t4status').innerHTML = "Error logging in.";
    		}
    	}
    };
    xhttp.open("POST", "team04/login", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({user: user, pass: pass}));
}

function logout() {
	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
    		console.log(this.responseText);
    		var res = JSON.parse(this.responseText);
    		if (res.success) {
    			getId('t4status').innerHTML = "Successfully logged out.";
    		} else {
    			getId('t4status').innerHTML = "Error logging out.";
    		}
    	}
    };
    xhttp.open("POST", "team04/logout", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({user: user, pass: pass}));
}

function getServerTime() {
	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
    		var res = JSON.parse(this.responseText);
    		if (res.success) {
    			getId('t4status').innerHTML = "Server time: " + res.time;
    		} else {
    			getId('t4status').innerHTML = "Got a result back, but it wasn't a success. Your response should have had a 401 status code."
    		}
    	}
    	if (this.readyState == 4 && this.status == 401) {
    		getId('t4status').innerHTML = "Could not get server time.";
    	}
    };
    xhttp.open("GET", "team04/getServerTime", true);
    xhttp.send();
}