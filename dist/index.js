"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var readline_sync_1 = __importDefault(require("readline-sync"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var node_dir_1 = __importDefault(require("node-dir"));
var is_image_1 = __importDefault(require("is-image"));
var ts_exif_parser_1 = require("ts-exif-parser");
var moment_1 = __importDefault(require("moment"));
var log4js_1 = __importDefault(require("log4js"));
var logger = log4js_1.default.getLogger();
logger.level = 'debug';
/*

App to organize photos in an folder

steps:
. Give a named folder
. Find the photo properties (date)
. Separate the photos by folder on a MM/YYYY format

*/
function askFolderToReadPhotos() {
    var question = 'Pasta para organizar as fotos: ';
    var path = readline_sync_1.default.question(question, { encoding: 'utf8' });
    while (!fs_1.default.existsSync(path)) {
        logger.warn(path.toString());
        logger.error('Esta pasta não existe. Informe outra.');
        path = readline_sync_1.default.question(question);
    }
    return path;
}
function tsParseFile(fullPath) {
    var buffer = fs_1.default.readFileSync(fullPath);
    var parser = ts_exif_parser_1.ExifParserFactory.create(buffer);
    parser.enableBinaryFields(true);
    parser.enablePointers(true);
    parser.enableImageSize(true);
    parser.enableReturnTags(true);
    parser.enableSimpleValues(true);
    parser.enableTagNames(true);
    return parser;
}
function createDir(path, file, parser) {
    var pathToCreate;
    if (parser == null) {
        pathToCreate = path + "/" + moment_1.default(fs_1.default.statSync(file).mtime).format('YYYY') + "/" + moment_1.default(fs_1.default.statSync(file).mtime).format('MM');
    }
    else {
        pathToCreate =
            parser.parse() !== undefined
                ? path + "/" + moment_1.default
                    .unix(Number(parser.parse().tags.DateTimeOriginal))
                    .format('YYYY') + "/" + moment_1.default
                    .unix(Number(parser.parse().tags.DateTimeOriginal))
                    .format('MM')
                : path + "/" + moment_1.default(fs_1.default.statSync(file).mtime).format('YYYY') + "/" + moment_1.default(fs_1.default.statSync(file).mtime).format('MM');
    }
    if (!fs_1.default.existsSync(pathToCreate)) {
        fs_1.default.mkdirSync(pathToCreate, { recursive: true });
    }
    return pathToCreate;
}
function deleteJunkFiles(path) {
    try {
        var files = node_dir_1.default.files(path, { sync: true });
        files.forEach(function (file) {
            if (
            // ['.plist', '.heic', '.aae', '.thm', '.lrv'].includes(
            ['.plist', '.aae', '.thm', '.lrv'].includes(path_1.default.extname(file).toLowerCase())) {
                fs_1.default.unlinkSync(file);
            }
        });
    }
    catch (err) {
        logger.error(err);
    }
}
function organizePhotos(path) {
    var pathToCreate;
    var files = node_dir_1.default.files(path, { sync: true });
    files.forEach(function (file) {
        if (fs_1.default.lstatSync(file).isFile()) {
            if (is_image_1.default(file)) {
                var parser = tsParseFile(file);
                pathToCreate = createDir(path, file, parser);
            }
            else {
                pathToCreate = createDir(path, file);
            }
            fs_1.default.renameSync(file, pathToCreate + "/" + file.split('/').pop());
        }
    });
}
function start() {
    // ask for folder
    var path = askFolderToReadPhotos();
    deleteJunkFiles(path);
    organizePhotos(path);
}
start();
