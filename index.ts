import {readFile, writeFile} from 'fs';
import {basename, extname} from 'path';
import * as pify from 'pify';

const hasSafeNum = /-(\d+)$/;

const pifyRead = pify(readFile);
const pifyWrite = pify(writeFile);

export function read(filename: string) {
  return pifyRead(filename, {encoding: 'utf8'});
}

function getNextFilename(filename: string) {
  const ext = extname(filename);
  const base = basename(filename, ext);
  const match = hasSafeNum.exec(base);
  if (match) {
    return base.substring(0, match.index) + '-' + (parseInt(match[1], 10) + 1) + ext;
  } else {
    return `${base}-1${ext}`;
  }
}

export function write(filename: string, data: any, safe: boolean) {
  const flag = safe ? 'wx' : 'w';
  return pifyWrite(filename, data, {encoding: 'utf8', flag});
}

export function writeSafely(filename: string, data: any): Promise<any> {
  return write(filename, data, true).catch((err) => {
    if (err && err.code === 'EEXIST') {
      filename = getNextFilename(filename);
      // console.log('File', err.path, 'already exists. Trying', filename, '...');
      return writeSafely(filename, data);
    }
  });
}
