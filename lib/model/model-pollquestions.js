var mysql       = require('mysql');
var globals 	= require('./../globals');
var connection 	= mysql.createConnection(globals.database());

function getPagedPolls(params,callback){

	var query = 'SELECT Pollid, Question, Category, sponsered,EndDate FROM pollquestions where deleted = false order by CreatedDate Desc LIMIT ? ,?';
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

	var query = 'SELECT OptionId, SequenceNo, OptionText FROM polloptions where deleted = false and Pollid = ? order by SequenceNo';
	var options  = [ params.pollid];
	connection.query(query,options, function(err, rows, fields){
		if(err){
			callback(err);
		} else {
			callback(null, rows);
		}
	});
}

function getArchivePolls(params,callback){

	var query = 'SELECT Pollid, Question, Category, sponsered,StartDate,EndDate FROM pollquestions where deleted = false and';
		query += ' pollid in (select pollid from userresponse where userid = ? and archived = true) order by CreatedDate Desc LIMIT ? ,?';
	var options  = [ params.userid,params.offset,params.count];
	connection.query(query,options, function(err, rows, fields){
		if(err){
			callback(err);
		} else {
			callback(null, rows);
		}
	});
}
function getPoll(params, callback){
	var query ='SELECT Pollid, Question, Category, sponsered,StartDate,EndDate FROM pollquestions where deleted = false ';
	if(params.pollid!="0")
	{
		query+= '  and Pollid=' + connection.escape(params.pollid);
	}else
	{
		query+= '  order by Pollid desc limit 0,1 ';
	}
	
	connection.query(query, function(err, rows, fields){
		if(err){
			callback(err);
		} else {
			if(rows.length > 0){
				var questionObject = rows[0];				
				getPollOptions({pollid: questionObject.Pollid}, function(err, obj){
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

function getNextPoll(params, callback){
	var query ='SELECT Pollid, Question, Category, sponsered,StartDate,EndDate FROM pollquestions where deleted = false and Pollid>' + connection.escape(params.pollid);
	if(params.category)
	{
		query+=' and Category =' + connection.escape(params.category);
	}
	query+=' order by Pollid limit 0,1';
	connection.query(query, function(err, rows, fields){
		if(err){
			callback(err);
		} else {
			if(rows.length > 0){
				var questionObject = rows[0];				
				getPollOptions({pollid: questionObject.Pollid}, function(err, obj){
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

function getPrevPoll(params, callback){
	var query ='SELECT Pollid, Question, Category, sponsered,StartDate,EndDate FROM pollquestions where deleted = false and Pollid<' + connection.escape(params.pollid);
	if(params.category)
	{
		query+=' and Category =' + connection.escape(params.category);
	}
		query+=' order by Pollid DESC limit 0,1';
	connection.query(query, function(err, rows, fields){
		if(err){
			callback(err);
		} else {
			if(rows.length > 0){
				var questionObject = rows[0];				
				getPollOptions({pollid: questionObject.Pollid}, function(err, obj){
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

exports.getPagedPolls = getPagedPolls;
exports.getPoll = getPoll;
exports.getArchivePolls = getArchivePolls;
exports.getNextPoll = getNextPoll;
exports.getPrevPoll = getPrevPoll;