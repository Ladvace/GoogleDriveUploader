import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import util, { promisify } from 'util';
import { Promise } from 'bluebird';
import opn from 'opn';
import path from 'path';
import { homedir } from 'os';
import prompt from 'prompt-sync';


const FILENAME = '813427.jpg';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = 'token.json';

export const readFileAsync = util.promisify(fs.readFile);

async function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  await opn(authUrl);
  const code = await prompt()('Enter the code from that page here: ');
  try {
    // const getTokenAsync = Promise.promisify(oAuth2Client.getToken);
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    // Store the token to disk for later program executions
    await util.promisify(fs.writeFile)(TOKEN_PATH, JSON.stringify(tokens));
  } catch (error) {
    console.log(error.message);
  }
  return oAuth2Client;
}

export async function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed; // eslint-disable-line
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]
  );

  // Check if we have previously stored a token.
  try {
    const token = await readFileAsync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
  } catch (err) {
    return getAccessToken(oAuth2Client);
  }
  return oAuth2Client;
}


export async function listFiles(auth) {
  const fileMetadata = {
    name: FILENAME,
  };
  const media = {
    mimeType: 'image/jpeg',
    body: fs.createReadStream(path.join(homedir(), 'Pictures', FILENAME)),
  };
  const drive = google.drive({ version: 'v3', auth });
  const createDFile = Promise.promisify(drive.files.create);
  const file = await createDFile({
    resource: fileMetadata,
    media,
    fields: 'id',
  });
  console.log(file.data.id);
}
