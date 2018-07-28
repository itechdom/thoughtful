var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;
let userSchema = new Schema({
	id: String,
	name: String,
	accessToken:String,
	refreshToken:String,
	image:String
});
userSchema.plugin(findOrCreate);

// set up a mongoose model
module.exports = mongoose.model('User', userSchema);
