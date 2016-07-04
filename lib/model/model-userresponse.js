var mysql       = require('mysql');
var globals 	= require('./../globals');
var connection 	= mysql.createConnection(globals.database());

function markReposnse(params,callback){

	var userResponse = {
		userid: params.userid,
		pollid: params.pollid,
		responseid: params.responseid,
		archived: 0,
		CreatedDate: new Date()
	}

	
	var query = 'INSERT INTO userresponse set ?';
	
	connection.query(query,userResponse, function(err, rows, fields){
		if(err){
		console.log(err);
			callback(err);
		} else {
			var objReturn = {message:'Success'};
			getPollResult({pollid:params.pollid},function(err,obj){
				if(err){
					callback(err,objReturn)
				}else
				{
					objReturn.Result = obj;
					var modelpolls = require('./model-pollquestions');
					modelpolls.getPoll({pollid:params.pollid},function(err,obj){
						if(err){
							callback(err,objReturn)
						}else
						{
							objReturn.pollquestion = obj;							
							callback(null, objReturn);
						}
					});
				}
			});
			
		}
	});
}

function sendToArchive(params,callback){

	
	var userResponse = {
		userid: params.userid,
		pollid: params.pollid,
		responseid: -1,
		archived: 1,
		CreatedDate: new Date()
	}

	
	var query = 'INSERT INTO userresponse set ?';
	
	
	connection.query(query,userResponse, function(err, rows, fields){
		if(err){
		console.log(err);
			callback(err);
		} else {
			var objReturn = {message:'Success'};
			getPollResult({pollid:params.pollid},function(err,obj){
				if(err){
					callback(err,objReturn)
				}else
				{
					objReturn.Result = obj;
					var modelpolls = require('./model-pollquestions');
					modelpolls.getPoll({pollid:params.pollid},function(err,obj){
						if(err){
							callback(err,objReturn)
						}else
						{
							objReturn.pollquestion = obj;							
							callback(null, objReturn);
						}
					});
				}
			});
			
		}
	});
}


function getPollResult(params, callback){
	var query ='SELECT IFNULL(responseid,0) optionid, po.optiontext optiontext,IFNULL(COUNT(responseid),0) votes, po.sequenceno, pq.question FROM userresponse  ur';
query += ' RIGHT OUTER JOIN polloptions po ON po.optionid = ur.responseid';
query += ' INNER JOIN pollquestions pq ON pq.pollid = ur.pollid';
		query += ' 	WHERE po.pollid = ' + connection.escape(params.pollid) +' and ur.responseid !=-1 GROUP BY ur.responseid ,po.optiontext,po.sequenceno, pq.question ORDER BY po.sequenceno'
	console.log(query);
	connection.query(query, function(err, rows, fields){
		if(err){
			callback(err);
		} else {
			if(rows.length > 0){
				var questionObject = rows;				
				callback(null, questionObject);
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

exports.markReposnse = markReposnse;
exports.sendToArchive = sendToArchive;
exports.createUser = createUser;
