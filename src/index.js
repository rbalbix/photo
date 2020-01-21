const readlineSync = require('readline-sync');
const fs = require('fs');
const dir = require('node-dir');
const isImage = require('is-image');
const exif = require('exif-parser');
const moment = require('moment');
const log4js = require('log4js');

const logger = log4js.getLogger();
logger.level = 'debug';

/*

App to organize photos in an folder

steps:
. Give a nnamed folder
. Find the photo properties (date)
. Separate the photos by folder on a MM/YYYY format

*/

function askFolderToReadPhotos() {
  const question = 'Pasta para organizar as fotos: ';
  let path = readlineSync.question(question, { encoding: 'utf8' });
  while (!fs.existsSync(path)) {
    logger.warn(path.toString('utf8'));
    logger.error('Esta pasta não existe. Informe outra.');
    path = readlineSync.question(question);
  }
  return path;
}

function parseFile(fullPath) {
  const buffer = fs.readFileSync(fullPath);
  const parser = exif.create(buffer);
  parser.enableBinaryFields(true);
  parser.enablePointers(true);
  parser.enableImageSize(true);
  parser.enableReturnTags(true);
  parser.enableSimpleValues(true);
  parser.enableTagNames(true);


  return parser;
}

function createDir(parser, path, file) {
  let pathToCreate;
  if (parser == null) {
    pathToCreate = `${path}/${moment(fs.statSync(file).birthtime).format('YYYY')}/${moment(fs.statSync(file).birthtime).format('MM')}`;
  } else {
    pathToCreate = (parser.parse().tags.DateTimeOriginal !== undefined)
      ? `${path}/${moment.unix(parser.parse().tags.DateTimeOriginal).format('YYYY')}/${moment.unix(parser.parse().tags.DateTimeOriginal).format('MM')}`
      : `${path}/${moment(fs.statSync(file).mtime).format('YYYY')}/${moment(fs.statSync(file).mtime).format('MM')}`;
  }

  if (!fs.existsSync(pathToCreate)) {
    fs.mkdirSync(pathToCreate, { recursive: true });
  }
  return pathToCreate;
}

function organizePhotos(path, files) {
  let pathToCreate;
  files.forEach((file) => {
    if (fs.lstatSync(file).isFile()) {
      if (isImage(file)) { // VERIFY IMAGE. IF NOT, USE SO DATE
        const parser = parseFile(file);
        // createDir(path)
        pathToCreate = createDir(parser, path, file);
      } else {
        pathToCreate = createDir(null, path, file);
      }
      // moveFile
      fs.renameSync(file, `${pathToCreate}\\${file.split('\\').pop()}`);
    }
  });
}

// main function
function start() {
  // ask for folder
  const path = askFolderToReadPhotos();
  // read all photo files
  dir.promiseFiles(path)
    .then((files) => {
      // read the properties of each file
      organizePhotos(path, files);
    })
    .catch((e) => logger.error(e));
  // read the properties of each file
  // organizePhotos(path, files);
}

start();
