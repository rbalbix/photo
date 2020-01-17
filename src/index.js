const readlineSync = require('readline-sync');
const fs = require('fs');
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

function readFolder(path) {
  return fs.readdirSync(path, 'utf-8');
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

function createDir(parser, path, fullPath) {
  const pathToCreate = (parser.parse().tags.DateTimeOriginal !== undefined)
    ? `${path}/${moment.unix(parser.parse().tags.DateTimeOriginal).format('YYYY')}/${moment.unix(parser.parse().tags.DateTimeOriginal).format('MM')}`
    : `${path}/${moment(fs.statSync(fullPath).mtime).format('YYYY')}/${moment(fs.statSync(fullPath).mtime).format('MM')}`;

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
      logger.debug(parser);
      // createDir(path)
      const pathToCreate = createDir(parser, path, fullPath);

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
  logger.debug(files);
  // read the properties of each file
  // organizePhotos(path, files);
}

start();
