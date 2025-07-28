import { Readable } from "stream";
import { createGunzip, createGzip } from "zlib";

export async function collectDataFromStream(stream: Readable): Promise<Buffer> {
  return new Promise((res, rej) => {
    const chunks: Buffer[] = [];

    stream.on('error', (err) => {
      rej(err);
    });

    stream.on('data', (chunk) => {
      if (!Buffer.isBuffer(chunk)) chunk = Buffer.from(chunk);
      chunks.push(chunk);
    });

    stream.on('end', () => {
      res(Buffer.concat(chunks));
    });
  });
}

export async function unzipStream(data: Buffer): Promise<Buffer> {
  const gunzip = createGunzip();
  Readable.from(data).pipe(gunzip);
  return collectDataFromStream(gunzip);
}

export async function zipStream(data: Buffer): Promise<Buffer> {
  const gzip = createGzip();
  Readable.from(data).pipe(gzip);
  return collectDataFromStream(gzip);
}