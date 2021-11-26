'use strict';

require('dotenv').config({ encoding: 'utf8', debug: process.env.DEBUG, });

const GLOBAL =
{
    name: process.env.NAME,
    script: 'private/index.js',

    ignore_watch: [ 'node_modules', 'public/storage/log', 'public/storage/data', ],

    pid_file: 'public/storage/log/server.pid',
    out_file: 'public/storage/log/server-out.log',
    error_file: 'public/storage/log/server-error.log',
};

if (process.env.NODE_ENV == 'production') {

    module.exports = [{ ...GLOBAL, // env: { PORT: process.env.PORT, }, increment_var: 'PORT', instances: 'max', //

        watch: false,

        exec_mode: 'cluster',
        instances: 1,
    }];

} else {

    module.exports = [{ ...GLOBAL,

        watch: true,

        exec_mode: 'fork',
        instances: 1,
    }];
}