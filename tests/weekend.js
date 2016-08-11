/*jshint esversion: 6, node: true*/
const fs = require('fs');
const oxspeech = require('../app');
const config = require('../config');
const expectedJSON = require('./weekend.json');

var cred = {
  client_id: config.credentials.client_id,
  client_secret: config.credentials.client_secret
};
console.log(cred);
oxspeech.authenticate(cred, (err, access_token) => {
  if(err) throw err;
  console.log('successfully authentificated');
  var wav = fs.readFileSync('./tests/weekend.wav');
  oxspeech.recognize({access_token: access_token}, wav, (error, data) => {
    if (data.header.status !== 'success') {
      throw 'the api did not answer with a success status';
    }

    if (data.header.name === expectedJSON.header.name) {
      console.log('successfully recognized');
    } else {
      console.log('error: transcription mismatch');
      console.log('current:', data.header.name);
      console.log('expected:', expectedJSON.header.name);
      throw 'unexpected transcription result';
    }
  });
});
