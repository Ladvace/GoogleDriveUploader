'use strict';

var _auth = require('./auth');

(async function () {
  try {
    var credential = await (0, _auth.readFileAsync)('credentials.json');
    var autorizzazione = await (0, _auth.authorize)(JSON.parse(credential));
    await (0, _auth.listFiles)(autorizzazione);
  } catch (error) {
    console.log(error);
  }
})();