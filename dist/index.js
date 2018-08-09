'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _readline = require('readline');

var _readline2 = _interopRequireDefault(_readline);

var _googleapis = require('googleapis');

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _opn = require('opn');

var _opn2 = _interopRequireDefault(_opn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_readline2.default.Interface.prototype.question[_util.promisify.custom] = function (prompt) {
  var _this = this;

  return new _bluebird.Promise(function (resolve) {
    return _readline2.default.Interface.prototype.question.call(_this, prompt, resolve);
  });
};
_readline2.default.Interface.prototype.questionAsync = (0, _util.promisify)(_readline2.default.Interface.prototype.question);

// PROMISIFICATION
var readFileAsync = _util2.default.promisify(_fs2.default.readFile);

var SCOPES = ['https://www.googleapis.com/auth/drive.file'];
var TOKEN_PATH = 'token.json';

async function getAccessToken(oAuth2Client) {
  var authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });

  await (0, _opn2.default)(authUrl);
  var rl = _readline2.default.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  var code = await rl.questionAsync('Enter the code from that page here: ');
  rl.close();
  return oAuth2Client.getToken(code, async function (err, token) {
    if (err) {
      console.log(err);
      return;
    }
    oAuth2Client.setCredentials(token);
    // Store the token to disk for later program executions
    await _util2.default.promisify(_fs2.default.writeFile)(TOKEN_PATH, JSON.stringify(token));
    return oAuth2Client;
  });
}

async function listFiles(auth) {
  var fileMetadata = {
    'name': 'RENDER.png'
  };
  var media = {
    mimeType: 'image/jpeg',
    body: _fs2.default.createReadStream('../../../pictures/RENDER.png')
  };
  var drive = _googleapis.google.drive({ version: 'v3', auth: auth });
  var createDFile = _bluebird.Promise.promisify(drive.files.create);
  var file = await createDFile({
    resource: fileMetadata,
    media: media,
    fields: 'id'
  });
  console.log(file.data.id);
};

async function authorize(credentials) {
  var _credentials$installe = credentials.installed,
      client_secret = _credentials$installe.client_secret,
      client_id = _credentials$installe.client_id,
      redirect_uris = _credentials$installe.redirect_uris;

  var oAuth2Client = new _googleapis.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  try {
    var token = await readFileAsync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
  } catch (err) {
    return getAccessToken(oAuth2Client);
  }
  return oAuth2Client;
};

(async function () {
  try {
    var credential = await readFileAsync('credentials.json');
    var autorizzazione = await authorize(JSON.parse(credential));
    await listFiles(autorizzazione);
  } catch (error) {
    console.log(error);
  }
})();