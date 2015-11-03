var path = require('path');
var fs = require('fs');
var color = require('colors');
var utils = require('../utils');
var request = require('request');

module.exports.run = function(args) {
  if (utils.getGUID() === null) {
    console.log("You must be logged in to publish extensions.".yellow);
    return
  }

  // set name to folder name if undefined
  var name = (args[1]) ? args[1] : path.basename(process.cwd());

  console.log("Publishing " + name.yellow + "...");

  var filename = process.cwd() + '/extension.js';
  fs.readFile(filename, 'utf-8', function(err, data) {
    if (err) {
      console.log('err =', err);
      console.log('Could not read extension.js');
      return;
    }

    try {
      var obj = JSON.parse(data);
      if (!isValidFile(obj)) {
        console.log('You are missing properties in your extension.'.red);
        return;
      }

      utils.zip('.', name, function() {

        var host;
        var demo = false;
        if (!demo) {
          host = "https://sonavoice.com";
        } else {
          host = "http://localhost:3000";
        }

        var formData = {
          guid: utils.getGUID(),
          extension: fs.createReadStream(utils.lodir(name + '.zip')),
          email: utils.getEmail(),
          name: name,
        };

        request.post({url:host + '/extension', formData: formData}, function (err, response, body) {
          if (response === undefined || response.statusCode !== 200) {
            console.log(("Unable to publish " + name + "! A server error occured.").red);
            console.log(body + "(" + response.statusCode + ")");
          } else {
            console.log((name + " was published successfully!").green);
          }
        });
      });


    } catch(e) {
      console.log(e);
      console.log('Invalid extension. Please check your syntax.'.red);
      return;
    }

  });

  function isValidFile(obj) {
    if (!obj.hasOwnProperty('title')) {
      console.log('Missing title.'.red);
      return false;
    } else if (!obj.hasOwnProperty('iconURL')) {
      console.log('Missing iconURL.'.red);
      return false;
    } else if (!obj.hasOwnProperty('commands')) {
      console.log('Missing commands'.red);
      return false;
    } else {
      return true;
    }
  }
}