var express 	= require('express');
var router 		= express.Router();
var model 		= require('./../lib/model/model-pollquestions');

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
  		res.send(obj);
  	}
  })
});


/* GET albums by user */
router.get('/poll/:pollid', function(req, res) {
	var params= {
		pollid: req.param('pollid')
	}
	model.getPoll(params, function(err, obj){
		if(err){
	  		res.status(500).send({error: 'An unknown server error has occurred!'});
	  	} else {
	  		res.send(obj);
	  	}
	});
});

/* POST user registration. */
router.post('/register', function(req, res) {
	if(req.param('username') && req.param('password') && req.param('email')){
		var email = unescape(req.param('email'));
		var emailMatch = email.match(/\S+@\S+\.\S+/);
		if (emailMatch !== null) {
			var params = {
				username: req.param('username').toLowerCase(),
				password: req.param('password'),
				email: req.param('email').toLowerCase()
			};

			model.createUser(params, function(err, obj){
				if(err){
					res.status(400).send({error: 'Unable to register'});
				} else {
					res.send(obj);
				}
			});
		} else {
			res.status(400).send({error: 'Invalid email'});
		}
	} else {
		res.status(400).send({error: 'Missing required field'});
	}
});

module.exports = router;
