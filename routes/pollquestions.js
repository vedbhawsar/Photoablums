var express 	= require('express');
var router 		= express.Router();
var model 		= require('./../lib/model/model-pollquestions');

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
/* GET users listing. */
router.get('/:page', function(req, res) {
	var params= {
		offset: (Number(req.param('page'))-1)*10,
		count:10
	}
  model.getPagedPolls(params,function(err, obj){
  	if(err){
  		res.status(500).send({error: 'An unknown server error has occurred!'+err});
  	} else {
		//res.writeHead(200,{'Content-Type':'application/json'});		
				res.status(200).send(obj);
  	}
  })
});
router.get('/archives/:userid/:page', function(req, res) {
	var params= {
		userid: (Number(req.param('userid'))),
		offset: (Number(req.param('page'))-1)*10,
		count:10
	}
  model.getArchivePolls(params,function(err, obj){
  	if(err){
  		res.status(500).send({error: 'An unknown server error has occurred!'+err});
  	} else {
		//res.writeHead(200,{'Content-Type':'application/json'});		
				res.status(200).send(obj);
  	}
  })
});



router.get('/poll/:pollid', function(req, res) {
	var pollid = req.params.pollid;
    var userid = req.param('userid');
	params= {
		pollid: pollid,
		userid: userid
	}	
	
	model.getPollNumber0(params, function(err, obj){
		if(err){
	  		res.status(500).send({error: 'An unknown server error has occurred! ved'+err});
	  	} else {
			//res.writeHead(200,{'Content-Type':'application/json'});		
				res.status(200).send(obj);
	  	}
	});
});

router.get('/nextpoll/:pollid', function(req, res) {
	var params= {
		pollid: req.param('pollid'),
		category: req.param('category'),
		userid: req.param('userid')
	}
	model.getNextPoll(params, function(err, obj){
		if(err){
	  		res.status(500).send({error: 'An unknown server error has occurred!'});
	  	} else {
			//res.writeHead(200,{'Content-Type':'application/json'});		
				res.status(200).send(obj);
	  	}
	});
});

router.get('/prevpoll/:pollid', function(req, res) {
	var params= {
		pollid: req.param('pollid'),
		category: req.param('category'),
		userid: req.param('userid')
	}
	model.getPrevPoll(params, function(err, obj){
		if(err){
	  		res.status(500).send({error: 'An unknown server error has occurred!'});
	  	} else {
			//res.writeHead(200,{'Content-Type':'application/json'});		
				res.status(200).send(obj);
	  	}
	});
});

/* POST user registration. */
router.post('/addquestion', function(req, res) {
	if(req.param('question') && req.param('category') && req.param('startdate')&& req.param('enddate')&& req.param('issponsered')){
		var question = unescape(req.param('question'));		
		if (question !== null) {
			var params = {
				question: req.param('question'),
				category: req.param('category'),
				startdate: req.param('startdate'),
				enddate: req.param('enddate'),
				sponsered: req.param('issponsered'),
				deleted:false,
				CreatedDate:new Date(),
				CreatedBy:'Admin'
			};

			model.addQuestion(params, function(err, obj){
				if(err){
					res.status(400).send({error: 'Unable to add question. error: '+err});
				} else {
					//res.writeHead(200,{'Content-Type':'application/json'});		
					res.status(200).send(obj);
				}
			});
		} else {
			res.status(400).send({error: 'Invalid Question'});
		}
	} else {
		res.status(400).send({error: 'Missing required field'});
	}
});
/* POST user registration. */
router.post('/addoption', function(req, res) {
	if(req.param('pollid') && req.param('sequenceno') && req.param('optiontext')){
		
			var params = {
				PollID: req.param('pollid'),
				SequenceNo: req.param('sequenceno'),
				OptionText: req.param('optiontext'),
				CreatedDate:new Date(),
				CreatedBy:'Admin'
			};

			model.addOptions(params, function(err, obj){
				if(err){
					res.status(400).send({error: 'Unable to add option.'+err});
				} else {
					//res.writeHead(200,{'Content-Type':'application/json'});		
					res.status(200).send(obj);
				}
			});
		
	} else {
		res.status(400).send({error: 'Missing required field'});
	}
});

module.exports = router;
