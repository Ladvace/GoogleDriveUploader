 import fs from 'fs';
 import readline from 'readline';
 import {google} from 'googleapis';
 import util from "util";
 import bluebird from "bluebird";
 
 const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
 const TOKEN_PATH = 'token.json';

 function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
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
    body: fs.createReadStream('../../pictures/RENDER.png')
  };
  const drive = google.drive({version: 'v3', auth});
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
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
  
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  };

(async () => {
  
  try{
    const credential =  await util.promisify(fs.readFile)('credentials.json');
    const autorizzazione = await Promise.promisify(authorize(JSON.parse(credential)));
    listFiles(autorizzazione);
  }
  catch(error){
    console.log(error);
  }



})();
