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

function getPollNumber0(params,callback){
	var query = 'SELECT Pollid as Pollid FROM pollquestions ';
		query+= '  where StartDate<' + connection.escape(new Date()) + ' and EndDate>' + connection.escape(new Date()) ;
		
		
		if(params.direction && params.direction=="next")
		{
			query+= ' and Pollid>' + connection.escape(params.pollid);
		}
		else if(params.direction && params.direction=="prev")
		{
			query+= ' and Pollid<' + connection.escape(params.pollid);
		}
		if(params.category)
		{		
			query+=' and Category =' + connection.escape(params.category);
		}	
		if(params.direction && params.direction=="next")
		{
			query+= ' Order by Pollid asc LIMIT 0,1';	
		}
		else
			query+= ' Order by Pollid desc LIMIT 0,1';	
	
	console.log(query);
	connection.query(query, function(err, rows, fields){
		if(err){
			callback(err);			
		} else {		
			if(rows.length > 0){
				var pi = rows[0].Pollid;				
				if(params.pollid !="0" && !params.direction)
				{
					pi = params.pollid;
				}
				if(Number(pi)>0)
				{
					isUserResponded({pollid: pi,userid : params.userid}, function(err, obj){
						if(err){
							callback(err);
						} else {
							if(obj.length == 0){
								getPoll({pollid: pi,userid : params.userid}, function(err, obje){
									if(err){
										callback(err);
									} else {
										callback(null, obje);												
									} 
								});
							}
							else
							{
								var objReturn = {message:'Success'};
								getPollResult({pollid:pi},function(err,obje){
									if(err){
										callback(err,objReturn)
									}else
									{
										objReturn.Result = obje;										
										getPoll({pollid:pi},function(err,objec){
											if(err){
												callback(err,objReturn)
											}else
											{
												objReturn.pollquestion = objec;							
												callback(null, objReturn);
											}
										});
									}
								});			
							}
						}
					});
				}				
			}
		}
	});
}

function isUserResponded(params,callback){
	var query = 'SELECT Pollid FROM userresponse where userid = ? and pollid = ?';	
		console.log(query);
	var options  = [ params.userid,params.pollid];
	connection.query(query,options, function(err, rows, fields){
		if(err){
			callback(err);
		} else {
			if(rows.length > 0){
				callback(null, rows);
			}
			else
				callback(null, rows);
		}
	});
}



function getPoll(params, callback){	
	var query ='SELECT Pollid, Question, Category, sponsered,StartDate,EndDate FROM pollquestions';
        query+= ' WHERE deleted = false ';
		query+= '  and StartDate<' + connection.escape(new Date()) + ' and EndDate>' + connection.escape(new Date()) ;
	if(params.pollid!="0")
	{
		query+= '  and Pollid=' + connection.escape(params.pollid);
	}else
	{
		query+= '  order by Pollid desc limit 0,1 ';
	}
	console.log(query);
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
			}
		}
	});
}

function getNextPoll(params, callback){	
	getPollNumber0({pollid: params.pollid,userid : params.userid,category : params.category,direction:"next"}, function(err, obj){
					if(err){
						callback(err);
					} else {
						callback(null, obj);
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
		
		getPollNumber0({pollid: params.pollid,userid : params.userid,category : params.category,direction:"prev"}, function(err, obj){
					if(err){
						callback(err);
					} else {
						callback(null, obj);
					}
				});
}

function addQuestion(params, callback){
	
	var query = 'INSERT INTO PollQuestions SET ? ';

	connection.query(query, params, function(err, rows, fields) {
	  	if (err) {
				callback(err);			
		} else {
  			callback(null, {message:'Added successfully!',pollid :rows.insertId});
  		}
	});

}

function addOptions(params, callback){
	
	var query = 'INSERT INTO PollOptions SET ? ';

	connection.query(query, params, function(err, rows, fields) {
	  	if (err) {
				callback(err);			
		} else {
  			callback(null, {message:'Added successfully!',optionid :rows.insertId});
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


exports.getPagedPolls = getPagedPolls;
exports.getPoll = getPoll;
exports.getPollNumber0 = getPollNumber0;
exports.getArchivePolls = getArchivePolls;
exports.getPollResult = getPollResult;
exports.getNextPoll = getNextPoll;
exports.getPrevPoll = getPrevPoll;
exports.addQuestion = addQuestion;
exports.addOptions = addOptions;