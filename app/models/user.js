var mongoose = require('mongoose');
var db = require('../config');
var Promise = require('bluebird');

var User = mongoose.model('User', db.UserSchema);

module.exports = User;
