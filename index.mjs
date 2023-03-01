import fs from 'fs';
import path from 'path';
import unzip from 'unzipper';

// lambda needs 30 seconds to run (reduced with rsync probably)
// lambda needs 500mb memory and 1000MB ephemeral storage

const Commander = async function Commander({ fetchZipUrl = 'https://DevInfra-dNKuvJhhwog15wXFxbUYtdQRCOMUyBy3P6RPiJt1Nrk0-s.iap.dev0.run/', lambdaContext, lambdaEvent, fileName = 'lambdaFunc.js' }) {
  const r = await /* global fetch */ fetch(fetchZipUrl);
  const t = await r.blob();
  const arrayBuffer = await t.arrayBuffer();
  const buff = Buffer.from(arrayBuffer);
  const writer = fs.createWriteStream('/tmp/package.zip');
  const writerPromise = new Promise((resolve, reject) => {
    writer.write(buff, (err) => {
      if (err) reject(err);
      const str = fs.createReadStream('/tmp/package.zip').pipe(unzip.Extract({ path: '/tmp/package' }));
      str.on('close', resolve);
    });
  });
  await writerPromise;
  const {default: f } = await import(`/tmp/package/src/${fileName}`);
  return f(lambdaEvent);
};

export const handler = async(lambdaEvent) => {
  const result = await Commander({ lambdaEvent });
  return result
}