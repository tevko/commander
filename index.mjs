import fs from 'fs';
import path from 'path';
import unzip from 'unzipper';
import rimraf from 'rimraf';

// lambda needs 30 seconds to run (reduced with rsync probably)
// lambda needs 500mb memory and 1000MB ephemeral storage

const Commander = async function Commander({ fetchZipUrl = 'https://DevInfra-dNKuvJhhwog15wXFxbUYtdQRCOMUyBy3P6RPiJt1Nrk0-s.iap.dev0.run/', lambdaContext, lambdaEvent, fileName = 'lambdaFunc.js' }) {
  // add is prod flag, 
  const cacheBreaker = Date.now();
  const r = await /* global fetch */ fetch(fetchZipUrl);
  const t = await r.blob();
  const arrayBuffer = await t.arrayBuffer();
  const buff = Buffer.from(arrayBuffer);
  const writer = fs.createWriteStream(`/tmp/${cacheBreaker}-package.zip`);
  const writerPromise = new Promise((resolve, reject) => {
    writer.write(buff, (err) => {
      if (err) return reject(err);
      const str = fs.createReadStream(`/tmp/${cacheBreaker}-package.zip`).pipe(unzip.Extract({ path: `/tmp/${cacheBreaker}-package` }));
      str.on('close', resolve);
    });
  });
  await writerPromise;
  const {default: f } = await import(`/tmp/${cacheBreaker}-package/src/${fileName}`);
  // add try / catch below - on catch, post to fetchZipUrl with error message and other helpful details
  return f(lambdaEvent);
};

export const handler = async(lambdaEvent) => {
  const result = await Commander({ lambdaEvent });
  return result
}