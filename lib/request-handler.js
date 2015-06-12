var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.favIcon = function(req, res) {
  res.send(200);
}

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find({},function(err, links) {
    res.send(200, links);
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.findOne({ url: uri }).exec(function(err, found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });
        link.createShortcode();
        link.save(function(err, newLink) {
          res.send(200, newLink);
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username }).exec(function(err, user) {
    console.log(user);
      if (!user) {
        console.log('no user');
        res.redirect('/login');
      } else {
        user.comparePassword(password, function(err, match) {
          if(err) {
            console.log(err);
          }
          if (match) {
            util.createSession(req, res, user);
          } else {
            console.log('wrong password');
            res.redirect('/login');
          }
        })
      }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User
    .findOne({ username: username }).exec(function(err, user) {
            if (!user) {
              var newUser = new User({
                username: username,
                password: password
              });
              newUser.hashPassword();
              newUser.save(function(err, newUser) {
                  util.createSession(req, res, newUser);
                });
            } else {
              console.log('Account already exists');
              res.redirect('/signup');
            }
          });
};

exports.navToLink = function(req, res) {
  Link.findOne({ code: req.params[0] }).exec(function(err, link) {
    if (!link) {
      res.redirect('/');
    } else {
      res.redirect(link.get('url'));
    }
  });
};

