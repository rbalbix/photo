const readlineSync = require('readline-sync');
const fs = require('fs');
const exif = require('exif-parser');
const moment = require('moment');
const log4js = require('log4js');

/*

App to organize photos in an folder

steps:
. Give a nnamed folder
. Find the photo properties (date)
. Separate the photos by folder on a MM/YYYY format

*/

const logger = log4js.getLogger();

function askFolderToReadPhotos() {
  logger.error('Erro');
  return readlineSync.question('Pasta para organizar as fotos: ');
}

function readFolder(path) {
  return fs.readdirSync(path);
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

function createDir(parser, path) {
  const pathToCreate = `${path}/${moment.unix(parser.parse().tags.DateTimeOriginal).format('YYYY')}/${moment.unix(parser.parse().tags.DateTimeOriginal).format('MM')}`;
  if (!fs.existsSync(pathToCreate)) {
    fs.mkdirSync(pathToCreate, { recursive: true });
  }
  return pathToCreate;
}

function organizePhotos(path, files) {
  files.forEach((file) => {
    const fullPath = `${path}\\${file}`;
    if (fs.lstatSync(fullPath).isFile()) {
      // parseFile(fullPath)
      const parser = parseFile(fullPath);

      // createDir(path)
      const pathToCreate = createDir(parser, path);

      // moveFile
      fs.renameSync(fullPath, `${pathToCreate}\\${file}`);
    }
  });
}

// main function
function start() {
  // ask for folder
  const path = askFolderToReadPhotos();
  // read all photo files
  const files = readFolder(path);
  // read the properties of each file
  organizePhotos(path, files);
  // read the creation date
  // create folder MM/YYYY
  // move correspondent photos
}

start();
