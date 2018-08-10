import {
  readFileAsync,
  authorize,
  listFiles,
} from './auth';

(async () => {
  try {
    const credential = await readFileAsync('credentials.json');
    const autorizzazione = await authorize(JSON.parse(credential));
    await listFiles(autorizzazione);
  }
  catch (error) {
    console.log(error);
  }
})();
