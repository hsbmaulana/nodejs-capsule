'use strict';

const DIRECTORY_PUBLIC = __dirname + '/../public/';
const DIRECTORY_PRIVATE = __dirname + '/../private/';
const DIRECTORY_STORAGE = __dirname + '/../public/storage/';

/* Provide Environment */
// const environment = require('dotenv').config({ encoding: 'utf8', debug: process.env.DEBUG, }); //

/* Provide Identity */
global.identity = require('uuid');

/* Provide Dataize */
global.dataize = require('lodash');

/* Provide Router */
global.register = require('express'); global.boot = register(); global.router = register.Router();

/* Provide Cors */
const corsoptions = { origin: (process.env.CORS ? ((process.env.CORS == '*') ? '*' : process.env.CORS.split(',')) : false), methods: [ 'HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', ], credentials: true, };

const cors = require('cors');

/* Provide Protocol */
// Default : const protocol = require('http').createServer(router); //
// SSL/TLS : const protocol = require('https').createServer({ key: '', ca: '', cert: '', }, router); //

const protocol = require('http').createServer(router);

/* Provide Socket */
global.socket = require('socket.io')(protocol, { cors: corsoptions, allowEIO3: true, });

/* Provide File System */
const filesystem = require('fs'); const path = require('path');

/* Provide Log System */
global.logger = require('morgan');

/* Provide Uploader */

const filehandler = require('multer');

global.takeuploader = null;
global.takedownloader = null;

var storedriver = null,
    storename = function (feedback, datafile, callback) { var mime = datafile.mimetype.split('/'); callback(null, identity.v4() + '.' + mime[mime.length - 1]); },
    storevalidation = function (feedback, datafile, callback) { callback(null, true); };

if (process.env.FILESYSTEM_DRIVER == 'none') {

    storedriver = filehandler.memoryStorage();

    global.takeuploader = filehandler({ storage: storedriver, fileFilter: storevalidation, });
    global.takedownloader = null;

} else if (process.env.FILESYSTEM_DRIVER == 'local') {

    boot.use('/data', register.static(path.join(DIRECTORY_STORAGE, 'data')));

    storedriver = filehandler.diskStorage({ destination: path.join(DIRECTORY_STORAGE, 'data'), filename: storename, });

    global.takeuploader = filehandler({ storage: storedriver, fileFilter: storevalidation, });
    global.takedownloader = function (detailfile) { filesystem.unlink(path.join(DIRECTORY_STORAGE, 'data') + '/' + detailfile, function (error) {}); };
}

/****************************************** Start Middleware ******************************************/

global.middlewares =
{
    cors: cors(corsoptions),
};

/******************************************* End Middleware *******************************************/

if (process.env.NODE_ENV == 'production') {

    boot.use(require('helmet')());
    boot.use(require('compression')());
}

boot.use(register.json()); // Recognize 'application/json' //
boot.use(register.urlencoded({ extended: false, })); // Recognize 'application/x-www-form-urlencoded' // // When : (true) qs, (false) querystring //
boot.use(takeuploader.single('data')); // Recognize 'multipart/form-data' //

boot.use(logger('combined', { stream: filesystem.createWriteStream(path.join(DIRECTORY_STORAGE, 'log/logger.log'), { flags: 'a', }), skip: function (request, response) { return response.statusCode < 400; }, }));

/****************************************** Start Route ******************************************/

// boot.use('/v' + process.env.VERSION, route); //

/******************************************* End Route *******************************************/

protocol.listen(parseInt(process.env.PORT), process.env.HOST, function () {

    if (process.env.NODE_ENV != 'production') {

        console.log(process.env.NAME + " -=> " + process.env.HOST + ":" + process.env.PORT);
    }
});