'use strict';

const argv = require('optimist').argv;

if (typeof argv.answer == 'undefined' || typeof argv.ack == 'undefined') {
    throw new TypeError('some script arguments are invalid');
}

let answer = argv.answer.toString().trim(),
    ack = argv.ack.toString().trim();

if (argv.i) {
    answer = answer.toLowerCase();
    ack = ack.toLowerCase();
}

process.stdout.write(`${answer === ack ? 100 : 0}\n`);