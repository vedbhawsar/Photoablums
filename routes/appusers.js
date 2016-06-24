var express 	= require('express');
var router 		= express.Router();
var model 		= require('./../lib/model/model-appusers');

/* GET users listing. */
router.get('/', function(req, res) {
  model.getAllUsers(function(err, obj){
  	if(err){
  		res.status(500).send({error: 'An unknown server error has occurred!'+err});
  	} else {
  		res.send(obj);
  	}
  })
});


/* GET albums by user */
router.get('/user/:user', function(req, res) {
	var params= {
		username: req.param('user')
	}
	model.getUser(params, function(err, obj){
		if(err){
	  		res.status(500).send({error: 'An unknown server error has occurred!'});
	  	} else {
	  		res.send(obj);
	  	}
	});
});

/* POST user login. */
router.post('/login', function(req, res) {
	if(req.param('username') && req.param('password') ){
		var params = {
			username: req.param('username').toLowerCase(),
			password: req.param('password')
		};

		model.loginUser(params, function(err, obj){
			if(err){
				res.status(400).send({error: 'Invalid login'});
			} else {
				res.send(obj);
			}
		});		
	} else {
		res.status(400).send({error: 'Invalid login'});
	}
});

/* POST user logout. */
router.post('/logout', function(req, res) {
	if(req.param('userID')){
		model.logoutUser({}, function(err, obj){
			if(err){
				res.status(400).send({error: 'Invalid user'});
			} else {
				res.send(obj);
			}
		});
	} else {
		res.status(400).send({error: 'Invalid user'});		
	}
});

/* POST user registration. */
router.post('/register', function(req, res) {
	if(req.param('username') && req.param('name') && req.param('email') && req.param('mobile') && req.param('pin') && req.param('androidid')){
		var email = unescape(req.param('email'));
		var emailMatch = email.match(/\S+@\S+\.\S+/);
		var mobile = unescape(req.param('mobile'));
		var mobileMatch = mobile.match(/\d{10}$/);
		if (emailMatch !== null && mobileMatch !== null ) {
			var params = {
				username: req.param('username').toLowerCase(),
				name: req.param('name').toLowerCase(),
				email: req.param('email').toLowerCase(),
				mobile: req.param('mobile'),
				pin: req.param('pin'),
				androidid: req.param('androidid'),
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

/* POST user update. */
router.post('/update', function(req, res) {
	if(req.param('userid') && req.param('username') && req.param('name') && req.param('pin') && req.param('androidid')){				
		var params = {
			userid: req.param('userid'),
			username: req.param('username').toLowerCase(),
			name: req.param('name').toLowerCase(),
			pin: req.param('pin'),
			androidid: req.param('androidid'),
		};

		model.updateUser(params, function(err, obj){
			if(err){
				res.status(400).send({error: 'Unable to update'});
			} else {
				res.send(obj);
			}
		});		
	} else {
		res.status(400).send({error: 'Missing required field'});
	}
});

module.exports = router;
