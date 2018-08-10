'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readFileAsync = undefined;
exports.authorize = authorize;
exports.listFiles = listFiles;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _readline = require('readline');

var _readline2 = _interopRequireDefault(_readline);

var _googleapis = require('googleapis');

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _bluebird = require('bluebird');

var _opn = require('opn');

var _opn2 = _interopRequireDefault(_opn);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _os = require('os');

var _promptSync = require('prompt-sync');

var _promptSync2 = _interopRequireDefault(_promptSync);

var _mimeTypes = require('mime-types');

var _mimeTypes2 = _interopRequireDefault(_mimeTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FILEPATH = process.argv[2]; // Relative to Homedir
var FILETYPE = _mimeTypes2.default.lookup("HorseHead.jpg");
console.log(FILETYPE);
var SCOPES = ['https://www.googleapis.com/auth/drive.file'];
var TOKEN_PATH = 'token.json';

var readFileAsync = exports.readFileAsync = _util2.default.promisify(_fs2.default.readFile);

async function getAccessToken(oAuth2Client) {
  var authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });

  await (0, _opn2.default)(authUrl);
  var code = await (0, _promptSync2.default)()('Enter the code from that page here: ');
  try {
    // const getTokenAsync = Promise.promisify(oAuth2Client.getToken);
    var _ref = await oAuth2Client.getToken(code),
        tokens = _ref.tokens;

    oAuth2Client.setCredentials(tokens);
    // Store the token to disk for later program executions
    await _util2.default.promisify(_fs2.default.writeFile)(TOKEN_PATH, JSON.stringify(tokens));
  } catch (error) {
    console.log(error.message);
  }
  return oAuth2Client;
}

async function authorize(credentials) {
  var _credentials$installe = credentials.installed,
      client_secret = _credentials$installe.client_secret,
      client_id = _credentials$installe.client_id,
      redirect_uris = _credentials$installe.redirect_uris; // eslint-disable-line

  var oAuth2Client = new _googleapis.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  try {
    var token = await readFileAsync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
  } catch (err) {
    return getAccessToken(oAuth2Client);
  }
  return oAuth2Client;
}

async function listFiles(auth) {
  var fileMetadata = {
    name: _path2.default.basename(FILEPATH)
  };
  var fileWrite = _fs2.default.createReadStream(_path2.default.resolve((0, _os.homedir)(), FILEPATH));
  // const fileSize = fs.statSync(path.resolve(homedir(), FILEPATH)).size;
  var media = {
    mimeType: FILETYPE,
    body: fileWrite
  };
  var drive = _googleapis.google.drive({ version: 'v3', auth: auth });
  var res = await drive.files.create({
    resource: {
      name: _path2.default.basename(FILEPATH),
      mimeType: FILETYPE
    },
    media: media,
    fields: 'id'
  });
}
/*
onUploadProgress: (evt) => {
        const progress = (evt.bytesRead / fileSize) * 100;
        console.log(`TOTAL FILE SIZE: ${fileSize} -- UPLOADED SO FAR: ${JSON.stringify(evt)}`);
      },
*/