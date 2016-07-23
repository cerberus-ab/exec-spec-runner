'use strict';

const SpecRunner = require('../esr');

// init spec runner
let sr = new SpecRunner(require('./mans'), {
    // scripts root dir
    rootDir: `examples/scripts`,
    // used parse function for scripts output
    parse: (output) => {
        let out = output.toString().split(/\r?\n/).filter((str) => str.trim().length);
        return out.length ? +out.pop() : null;
    }
});

// start tests
sr.run();
