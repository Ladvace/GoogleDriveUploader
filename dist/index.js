'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _readline = require('readline');

var _readline2 = _interopRequireDefault(_readline);

var _googleapis = require('googleapis');

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SCOPES = ['https://www.googleapis.com/auth/drive.file'];
var TOKEN_PATH = 'token.json';

function getAccessToken(oAuth2Client, callback) {
  var authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  var rl = _readline2.default.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function (code) {
    rl.close();
    oAuth2Client.getToken(code, function (err, token) {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      _fs2.default.writeFile(TOKEN_PATH, JSON.stringify(token), function (err) {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function listFiles(auth) {
  var fileMetadata = {
    'name': 'RENDER.png'
  };
  var media = {
    mimeType: 'image/jpeg',
    body: _fs2.default.createReadStream('../../pictures/RENDER.png')
  };
  var drive = _googleapis.google.drive({ version: 'v3', auth: auth });
  drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id'
  }, function (err, file) {
    if (err) {
      // Handle error
      console.error(err);
    } else {
      console.log('File: ', file.data.id);
    }
  });
};

function authorize(credentials, callback) {
  var _credentials$installe = credentials.installed,
      client_secret = _credentials$installe.client_secret,
      client_id = _credentials$installe.client_id,
      redirect_uris = _credentials$installe.redirect_uris;

  var oAuth2Client = new _googleapis.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  _fs2.default.readFile(TOKEN_PATH, function (err, token) {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
};

(async function () {

  try {
    var credential = await _util2.default.promisify(_fs2.default.readFile)('credentials.json');
    authorize(JSON.parse(credential), listFiles);
  } catch (error) {
    console.log(error);
  }
})();