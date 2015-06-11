var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var db = mongoose.connection;

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UrlSchema = new Schema({
  url: String,
  base_url: String,
  code: String,
  title: String,
  visits: Number,
});

var UserSchema = new Schema({
  username: String,
  password: String
});

UserSchema.methods.comparePassword = function(attemptedPassword, callback) {
  console.log('Called');
    bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
      callback(isMatch);
    });
  },

UserSchema.methods.hashPassword = function(){
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.get('password'), null, null).bind(this)
    .then(function(hash) {
      this.set('password', hash);
    });
}

exports.UrlSchema = UrlSchema;
exports.UserSchema = UserSchema;
db.once('open', function() {

});



mongoose.connect('mongodb://localhost/shawtlyDB');
