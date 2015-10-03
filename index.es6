import fs from 'fs';
import path from 'path';
import pify from 'pify';

let hasSafeNum = /-(\d+)$/;

let pifyRead = pify(fs.readFile);
let pifyWrite = pify(fs.writeFile);
export function read(filename) {
  return pifyRead(filename, {encoding: 'utf8'});
}

let getNextFilename = function (filename) {
  var ext = path.extname(filename),
      base = path.basename(filename, ext),
      match = hasSafeNum.exec(base);
  if (match) {
    return base.substring(0, match.index) + '-' + (match[1] * 1 + 1) + ext;
  } else {
    return base + '-1' + ext;
  }
};

export function write(filename, data, safe) {
  var flag = safe ? 'wx' : 'w';
  return pifyWrite(filename, data, {encoding: 'utf8', flag: flag});
}

export function writeSafely(filename, data) {
  return write(filename, data, true).catch(function (err) {
    if (err && err.code === 'EEXIST') {
      filename = getNextFilename(filename);
      console.log('File', err.path, 'already exists. Trying', filename, '...');
      return writeSafely(filename, data);
    }
  });
}