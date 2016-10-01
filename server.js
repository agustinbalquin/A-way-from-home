
// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var morgan     = require('morgan');

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port     = process.env.PORT || 8080; // set our port

var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost:27017/cs/customers'); // connect to our database
var Customer     = require('./app/models/customer');

// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });	
});

// on routes that end in /customers
// ----------------------------------------------------
router.route('/customers')

	// create a customer (accessed at POST http://localhost:8080/customers)
	.post(function(req, res) {
		
		var customer = new Customer();		// create a new instance of the Customer model
		customer.name = req.body.name;  // set the customers name (comes from the request)

		customer.save(function(err) {
			if (err)
				res.send(err);

			res.json({ message: 'Customer created!' });
		});

		
	})

	// get all the customers (accessed at GET http://localhost:8080/api/customers)
	.get(function(req, res) {
		Customer.find(function(err, customers) {
			if (err)
				res.send(err);

			res.json(customers);
		});
	});



//
//
router.route('/customer')

	// create a customer (accessed at POST http://localhost:8080/customers)
	.put(function(req, res) {
		
		Customer.updateOne({name: req.params.name}, 
		{
	        $set: {"authorized": "true"},
	        $currentDate: { "lastModified": true }
      	},function(err, customers) {
			if (err)
				res.send(err);

			res.json(customers);
		});
		
	})

	
	.get(function(req, res) {
		Customer.findOne({authorized: "false"}, function(err, customers) {
			if (err)
				res.send(err);

			res.json(customers);
		});
	});


// on routes that end in /customers/:customer_id
// ----------------------------------------------------
router.route('/customers/:customer_id')

	// get the customer with that id
	.get(function(req, res) {
		Customer.findById(req.params.customer_id, function(err, customer) {
			if (err)
				res.send(err);
			res.json(customer);
		});
	})

	// update the customer with this id
	.put(function(req, res) {
		Customer.findById(req.params.customer_id, function(err, customer) {

			if (err)
				res.send(err);

			customer.name = req.body.name;
			customer.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Customer updated!' });
			});

		});
	})

	// delete the customer with this id
	.delete(function(req, res) {
		Customer.remove({
			_id: req.params.customer_id
		}, function(err, customer) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted' });
		});
	});


// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
