a simple wrapper for oxford speech recognition

```
const fs = require('fs');
const oxspeech = require('../app.js');

var cred = {
  client_id: 'xxx',
  client_secret: 'xxx'
};
oxspeech.authenticate(cred, (err, access_token) => {
  if(err) throw err;
  console.log('successfully authentificated');
  var wav = fs.readFileSync('./tests/weekend.wav');
  oxspeech.recognize({access_token: access_token}, wav, (error, data) => {
    console.log(data.results[0].name);
  });
});

```
