import readlineSync from 'readline-sync';
import fs from 'fs';
import pathLib from 'path';
import dir from 'node-dir';
import isImage from 'is-image';
import { ExifParserFactory } from 'ts-exif-parser';
import moment from 'moment';
import log4js from 'log4js';
import { ExifParser } from 'ts-exif-parser/lib/ExifParser';

const logger = log4js.getLogger();
logger.level = 'debug';

/*

App to organize photos in an folder

steps:
. Give a named folder
. Find the photo properties (date)
. Separate the photos by folder on a MM/YYYY format

*/

function askFolderToReadPhotos() {
  const question = 'Pasta para organizar as fotos: ';
  let path = readlineSync.question(question, { encoding: 'utf8' });
  while (!fs.existsSync(path)) {
    logger.warn(path.toString());
    logger.error('Esta pasta não existe. Informe outra.');
    path = readlineSync.question(question);
  }
  return path;
}

function tsParseFile(fullPath: string) {
  const buffer = fs.readFileSync(fullPath);
  const parser = ExifParserFactory.create(buffer);

  parser.enableBinaryFields(true);
  parser.enablePointers(true);
  parser.enableImageSize(true);
  parser.enableReturnTags(true);
  parser.enableSimpleValues(true);
  parser.enableTagNames(true);

  return parser;
}

function createDir(path: string, file: string, parser?: ExifParser) {
  let pathToCreate;
  if (parser == null) {
    pathToCreate = `${path}/${moment(fs.statSync(file).mtime).format(
      'YYYY'
    )}/${moment(fs.statSync(file).mtime).format('MM')}`;
  } else {
    pathToCreate =
      parser.parse() !== undefined
        ? `${path}/${moment
            .unix(Number(parser.parse().tags!.DateTimeOriginal))
            .format('YYYY')}/${moment
            .unix(Number(parser.parse().tags!.DateTimeOriginal))
            .format('MM')}`
        : `${path}/${moment(fs.statSync(file).mtime).format('YYYY')}/${moment(
            fs.statSync(file).mtime
          ).format('MM')}`;
  }

  if (!fs.existsSync(pathToCreate)) {
    fs.mkdirSync(pathToCreate, { recursive: true });
  }
  return pathToCreate;
}

function deleteJunkFiles(path: string) {
  try {
    const files = dir.files(path, { sync: true });
    files.forEach((file) => {
      if (
        // ['.plist', '.heic', '.aae', '.thm', '.lrv'].includes(
        ['.plist', '.aae', '.thm', '.lrv'].includes(
          pathLib.extname(file).toLowerCase()
        )
      ) {
        fs.unlinkSync(file);
      }
    });
  } catch (err) {
    logger.error(err);
  }
}

function organizePhotos(path: string) {
  let pathToCreate;
  const files = dir.files(path, { sync: true });
  files.forEach((file) => {
    if (fs.lstatSync(file).isFile()) {
      if (isImage(file)) {
        const parser = tsParseFile(file);
        pathToCreate = createDir(path, file, parser);
      } else {
        pathToCreate = createDir(path, file);
      }
      fs.renameSync(file, `${pathToCreate}/${file.split('/').pop()}`);
    }
  });
}

function start() {
  // ask for folder
  const path = askFolderToReadPhotos();

  deleteJunkFiles(path);
  organizePhotos(path);
}

start();
