
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
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	console.log('Something is happening.');
	next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
  res.render('index', {});
});

router.post('/send/:email', function(req, res) {
	var recipientEmail = req.params.email;
	var recipientName = req.body.name;

	var templateId = '4b8fb9b5-89d8-4aae-a129-8c6761231cf7';

    // create JSON formatted auth header
    var creds = JSON.stringify({
      Username: 'abalq001@ucr.edu',
      Password: 'auggie123',
      IntegratorKey: '3b90f771-e1d8-451d-8b08-14c141927249'
    });
    apiClient.addDefaultHeader('X-DocuSign-Authentication', creds);

    // assign api client to the Configuration object
    docusign.Configuration.default.setDefaultApiClient(apiClient);

    var accountId = '1941950';



    // create a new envelope object that we will manage the signature request through
    var envDef = new docusign.EnvelopeDefinition();
    envDef.setEmailSubject('Please sign this document sent from Node SDK)');
    envDef.setTemplateId(templateId);

    // create a template role with a valid templateId and roleName and assign signer info
    var tRole = new docusign.TemplateRole();
    tRole.setRoleName('signer1');
    tRole.setName(recipientName);
    tRole.setEmail(recipientEmail);

    // create a list of template roles and add our newly created role
    var templateRolesList = [];
    templateRolesList.push(tRole);

    // assign template role(s) to the envelope
    envDef.setTemplateRoles(templateRolesList);

    var webhookUrl = 'http://596e74cf.ngrok.io/webhook';

    // Setup EventNotification settings
    var EventNotification = new docusign.EventNotification();
    EventNotification.setUrl(webhookUrl);
    EventNotification.setLoggingEnabled('true');
    EventNotification.setRequireAcknowledgment('true');
    EventNotification.setUseSoapInterface('false');
    EventNotification.setIncludeCertificateWithSoap('false');
    EventNotification.setSignMessageWithX509Cert('false');
    EventNotification.setIncludeDocuments('true');
    EventNotification.setIncludeEnvelopeVoidReason('true');
    EventNotification.setIncludeTimeZone('true');
    EventNotification.setIncludeSenderAccountAsCustomField('true');
    EventNotification.setIncludeDocumentFields('true');
    EventNotification.setIncludeCertificateOfCompletion('true');

    // Add states to get notified on (Envelope and Recipient-level)
    var envelopeEvents = [];
    ['sent','delivered','completed','declined','voided'].forEach(function(ev){
      var statusCode = new docusign.EnvelopeEvent()
      statusCode.setEnvelopeEventStatusCode(ev);
      envelopeEvents.push(statusCode);
    });

    var recipientEvents = [];
    ['Sent','Delivered','Completed','Declined','AuthenticationFailed','AutoResponded'].forEach(function(ev){
      var statusCode = new docusign.RecipientEvent()
      statusCode.setRecipientEventStatusCode(ev);
      recipientEvents.push(statusCode);
    });

    EventNotification.setEnvelopeEvents(envelopeEvents);
    EventNotification.setRecipientEvents(recipientEvents);
    envDef.setEventNotification(EventNotification);

    // send the envelope by setting |status| to "sent". To save as a draft set to "created"
    // - note that the envelope will only be 'sent' when it reaches the DocuSign server with the 'sent' status (not in the following call)
    envDef.setStatus('sent');

    // instantiate a new EnvelopesApi object
    var envelopesApi = new docusign.EnvelopesApi();

    console.log(JSON.stringify(envDef,null,2));

    // call the createEnvelope() API
    envelopesApi.createEnvelope(accountId, envDef, null, function (error, envelopeSummary, response) {
      if (error) {
        console.log('Error: ' + error);
        return;
      }

      if (envelopeSummary) {
        // Envelope created and sent successfully!
        console.log('EnvelopeSummary: ' + JSON.stringify(envelopeSummary));

      }
    });

});

router.post('/webhook', function(req, res) {
	console.log('done');
	res.send('done');
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
app.use(express.static(__dirname));

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Listening in on port ' + port);
