var mysql       = require('mysql');
var globals 	= require('./../globals');
var connection 	= mysql.createConnection(globals.database());

function getAllUsers(callback){
	connection.query('SELECT username, userID, Mobile FROM appusers', function(err, rows, fields){
		if(err){
			callback(err);
		} else {
			callback(null, rows);
		}
	});
}

function getUser(params, callback){
	connection.query('SELECT username, userID, Mobile FROM appusers WHERE username=' + connection.escape(params.username), function(err, rows, fields){
		if(err){
			callback(err);
		} else {
			if(rows.length > 0){
				var userObject = rows[0];				
				callback(null, userObject);								
			} else {
				callback(null, []);
			}
		}
	});
}
function getUserByMobile(params, callback){
	connection.query('SELECT username, userID, Mobile FROM appusers WHERE mobile=' + connection.escape(params.mobile), function(err, rows, fields){
		if(err){
			callback(err);
		} else {
			callback(null,rows);
		}
	});
}
function getUserByEmail(params, callback){
	connection.query('SELECT username, userID, Mobile FROM appusers WHERE email=' + connection.escape(params.email), function(err, rows, fields){
		if(err){
			callback(err);
		} else {
			callback(null,rows);
		}
	});
}
function createUser(params, callback){
	connection.query('SELECT username, userID, Mobile FROM appusers WHERE username=' + connection.escape(params.username), function(err, rows, fields){
		if(err){
			callback(err);
		} else {
			if(rows.length > 0){				
				callback("This UserName is already taken.");								
			} else {
				getUserByMobile({mobile: params.mobile}, function(err, obj){
					if(err){
						callback(err);
					} else {
						if(obj.length > 0){			
							callback("This mobile number is already registered.");								
						} else {
							getUserByMobile({email: params.email}, function(err, obje){
						    	if(err){
						    		callback(err);
						    	} else {
									if(obje.length > 0){			
										callback("This emailid is already registered.");								
									} else {
										createUser0(params, function(err, objec){
											if(err){
												callback(err);
											} else {
												callback(null,objec);
											}
										});
									}
						    		
						    	}
						    });
						}
					}
				});
			}
		}
	});
}
function createUser0(params, callback){

	var newUser = {
		username: params.username,
		name: params.name,
		email: params.email,
		mobile: params.mobile,
		pin: params.pin,
		androidid: params.androidid,
		verified :0,
		active:1,
		createddate:new Date()
	}
	
	var query = 'INSERT INTO appusers SET ? ';
	
		
	connection.query(query, newUser, function(err, rows, fields) {
	  	if (err) {
			if(err.errno == 1062){
		  		var error = new Error("This username has already been taken.");
		  		callback(error);	  		
			} else {
				callback(err);
			}
		} else {
			var createdUser = {
				userid :rows.insertId,
				username: params.username,
				name: params.name,
				email: params.email,
				mobile: params.mobile				
			}
  			callback(null, {message:'Registration successful!',user:createdUser});
  		}
	});

}
function updateUser(params, callback){

	var updatedInfo = [	
		params.username,
		params.name,
		params.pin,
		params.androidid,
		params.userid
	]
	
	var query = 'UPDATE appusers SET username = ?,name=?, pin = ?,androidid=? where userid = ?';
	
	connection.query(query, updatedInfo, function(err, rows, fields) {
	  	if (err) {
			if(err.errno == 1062){
		  		var error = new Error("This username has already been taken.");
		  		callback(error);	  		
			} else {
				callback(err);
			}
		} else {
  			callback(null, {message:'Updated Successfully!',userid :rows.insertId});
  		}
	});

}
function loginUser(params, callback){
	connection.query('SELECT username, userID FROM appusers WHERE username=' + connection.escape(params.username), function(err, rows, fields) {
		if(err){
	  		callback(err);	  		
		} else if(rows.length > 0){
	  		var response = {
	  			username: rows[0].username,
	  			userID: rows[0].userID
	  		}
	  		callback(null, response);
	  	} else {
	  		var error = new Error("Invalid login");
	  		callback(error);	  		
	  	}
	});
}


function logoutUser(params, callback){
	callback({message: 'You have logged out successfully'});
}

exports.getAllUsers = getAllUsers;
exports.getUser = getUser;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.loginUser = loginUser;
exports.logoutUser = logoutUser;
