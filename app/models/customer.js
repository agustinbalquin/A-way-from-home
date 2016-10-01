var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CustomerSchema   = new Schema({
	name: String,
	authorized: Boolean
});

module.exports = mongoose.model('Customer', CustomerSchema);
