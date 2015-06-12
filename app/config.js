var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Promise = require('bluebird');

var db = mongoose.connection;

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

db.on('error', console.error.bind(console, 'connection error'));

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

UserSchema.pre('save', function(next){
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
      next();
    });
});

UserSchema.methods.comparePassword = function(attemptedPassword, callback) {
    bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
      if(err) {
        callback(err, null);
      } else {
        callback(null, isMatch);
      }
    });
  },

// UserSchema.methods.hashPassword = function(){
//   var cipher = Promise.promisify(bcrypt.hash);
//   return cipher(this.password, null, null).bind(this)
//     .then(function(hash) {
//       this.password = hash;
//     });
// }

UrlSchema.methods.createShortcode = function(){
      var shasum = crypto.createHash('sha1');
      shasum.update(this.url);
      this.code = shasum.digest('hex').slice(0, 5);
    };

exports.UrlSchema = UrlSchema;
exports.UserSchema = UserSchema;
db.once('open', function() {

});

var hostUri = process.env.MONGO_URI || 'mongodb://localhost/shawtlyDB';

mongoose.connect(hostUri);
// mongoose.connect('mongodb://localhost/shawtlyDB');
