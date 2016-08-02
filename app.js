/*jshint esversion: 6, node: true*/

'use strict';
const https = require('https');
const fs = require('fs');
const querystring = require('querystring');
const config = require('./config.json');
const guid = require('guid');

var context = {
  instanceid: guid.raw(),
  appid: '6e4c33c9-54b6-3873-cab8-7a972ea7d77c',

  // token is available a certain time.
  // authentification answer specifies a "expires_in":"600",
  token_current: null,
  token_expires_at: null
};

// Authenticate the API call
function authenticate(credentials, cb) {
  var post_data = {
    'grant_type': 'client_credentials',
    'client_id': config.credentials.client_id,
    'client_secret': config.credentials.client_secret,
    'scope': 'https://speech.platform.bing.com'
  };

  var post_options = {
    method: 'POST',
    host: 'oxford-speech.cloudapp.net',
    path: '/token/issueToken',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  // Set up the request
  var post_req = https.request(post_options, (res) => {
    var chunks = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      chunks += chunk;
    });
    res.on('end', () => {
      var error, result;
      try {
        result = JSON.parse(chunks).access_token;
      } catch (e) {
        error = e;
      }
      cb(error, result);
    });
  });

  // post the data
  post_req.write(querystring.stringify(post_data));
  post_req.end();
}

function isAuthenticated() {
  return false;
}

function recognize(credentials, waveBin, cb) {
  if (typeof credentials.access_token !== 'string') {
    throw 'recognize: no token given';
  }

  var post_params = {
    'version': '3.0',
    'requestid': guid.raw(), // changes each call
    'instanceid': context.instanceid, // changes at each instance
    'appID': context.appid, // never changes
    'format': 'json',
    'locale': 'en-US',
    'device.os': 'Linux',
    'scenarios': 'ulm'
  };


  // querystring.stringify(
  // console.log('posting on /recognize' + '?' + querystring.stringify(post_params));

  var post_options = {
    method: 'POST',
    host: 'speech.platform.bing.com',
    path: '/recognize' + '?' + querystring.stringify(post_params),
    headers: {
      'Content-Type': 'audio/wav; samplerate=16000',
      'Authorization': 'Bearer ' + credentials.access_token
    }
  };

  // Set up the request
  var post_req = https.request(post_options, (res) => {
    var chunks = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      chunks += chunk;
      //console.log(chunk);
    });
    res.on('end', () => {
      console.log(chunks);
      var error, result;
      try {
        result = JSON.parse(chunks); //.results[0];
      } catch (e) {
        console.log(error,e);
        error = e;
      }
      cb(error, result);
    });
  });

  // post the data
  post_req.write(waveBin);
  post_req.end();
}



authenticate(null, (err, access_token) => {
  if(err) throw err;
  //console.log(access_token);
  var wav = fs.readFileSync('./weekend.wav');
  recognize({access_token: access_token}, wav, (error, data) => {
    //console.log(data.results[0].name);
    console.log(data);
  });
});
/*
module.exports = {
  authenticate: authenticate,
  recognize: recognize
};
*/
