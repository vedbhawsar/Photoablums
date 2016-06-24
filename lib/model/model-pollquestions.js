var mysql       = require('mysql');
var globals 	= require('./../globals');
var connection 	= mysql.createConnection(globals.database());

function getPagedPolls(params,callback){

	var query = 'SELECT Pollid, Question, Category, sponsered,EndDate FROM PollQuestions where deleted = false order by CreatedDate Desc LIMIT ? ,?';
	var options  = [ params.offset,params.count];
	connection.query(query,options, function(err, rows, fields){
		if(err){
			callback(err);
		} else {
			callback(null, rows);
		}
	});
}

function getPollOptions(params,callback){

	var query = 'SELECT OptionId, SequenceNo, OptionText FROM PollOptions where deleted = false and Pollid = ? order by SequenceNo';
	var options  = [ params.pollid];
	connection.query(query,options, function(err, rows, fields){
		if(err){
			callback(err);
		} else {
			callback(null, rows);
		}
	});
}


function getPoll(params, callback){
	var query ='SELECT Pollid, Question, Category, sponsered,EndDate FROM PollQuestions where deleted = false and Pollid=' + connection.escape(params.pollid);
	connection.query(query, function(err, rows, fields){
		if(err){
			callback(err);
		} else {
			if(rows.length > 0){
				var questionObject = rows[0];				
				getPollOptions({pollid: params.pollid}, function(err, obj){
					if(err){
						callback(err);
					} else {
						questionObject.Options = obj;
						callback(null, questionObject);
					}
				});
			} else {
				callback(null, []);
			}
		}
	});
}

function createUser(params, callback){

	var newUser = {
		username: params.username,
		password: params.password,
		email: params.email	
	}

	var query = 'INSERT INTO users SET ? ';

	connection.query(query, newUser, function(err, rows, fields) {
	  	if (err) {
			if(err.errno == 1062){
		  		var error = new Error("This username has already been taken.");
		  		callback(error);	  		
			} else {
				callback(err);
			}
		} else {
  			callback(null, {message:'Registration successful!'});
  		}
	});

}

exports.getPagedPolls = getPagedPolls;
exports.getPoll = getPoll;
exports.createUser = createUser;
