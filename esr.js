'use strict';

const fs = require('fs');
const execSync = require('child_process').execSync;

class Inspector {
    /**
     * Inspector class
     *
     * @constructor
     * @param {function} print
     */
    constructor(print) {
        this._total = 0;
        this._err = 0;
        this._signals = { '-1': '!', '0': '*', '1': '-' };
        this.print = print || process.stdout.write.bind(process.stdout);
    }

    /**
     * Register new entry
     *
     * @method Inspector.register
     * @param {string} message
     * @param {number} signal, Signal code: -1,0,1
     * @returns {boolean}
     */
    register(message, signal) {
        let success = signal === 1;
        this._total++;
        this._err += !success;
        this.print(this._signals[signal], message);
        return success;
    }

    /**
     * Clear inspector counters
     *
     * @method Inspector.clear
     * @returns {undefined}
     */
    clear() {
        this._total = this._err = 0;
    }

    /**
     * Getter for current result
     *
     * @method Inspector.result
     * @returns {boolean}
     */
    get result() {
        return !this._err;
    }

    /**
     * To string method
     *
     * @method Inspector.toString
     * @returns {string}
     */
    toString() {
        return `${this._total - this._err}/${this._total}`;
    }
}

class SpecRunner {
    /**
     * Spec runner class
     *
     * @constructor
     * @param {Array} mans, Target manifest
     * @param {object} options
     */
    constructor(mans, options) {
        Object.assign(this, {
            rootDir: './',
            parse: (output) => output,
            print: process.stdout.write.bind(process.stdout)

        }, options || {});

        this._mans = mans;
        this._insp = new Inspector((sig, message) => this.print(`   ${sig} ${message}\n`));
    }

    /**
     * Run specs
     *
     * @method SpecRunner.prototype.run
     * @returns {boolean} All tests have passed successful
     */
    run() {
        let begTime = +new Date;

        this._insp.clear();

        this.print('Testing executable scripts:\n');

        this._mans.forEach((man) => {
            this.print(`  Testing: ${man.name}\n`);

            // check script existence
            let script = `${this.rootDir}/${man.path}`,
                isExists = fs.existsSync(script);

            this._insp.register('script exists', +isExists);

            // execute tests
            man.tests.forEach((test, index) => {

            let output = null,
                isPassed = true,
                begTime = +new Date,
                cmdPreview = `${index +1}. "$ ${man.usage} ${man.name}${test.argv !== null ? ` ${test.argv}` : ''}" should be ${test.result}`,
                cmdExecute = `${man.usage} ${script}${test.argv !== null ? ` ${test.argv}` : ''}`;

            if (isExists) {
                try {
                    output = this.parse(execSync(cmdExecute, {
                        stdio: ['pipe', 'pipe', 'ignore']
                    }));
                    // if unexpected result then fail signal
                    if (output !== test.result) {
                        this._insp.register(`${cmdPreview} but returned ${output} [${+new Date - begTime} ms]`, 0);
                    }
                    // else successful
                    else {
                        this._insp.register(`${cmdPreview} [${+new Date - begTime} ms]`, 1);
                    }
                }
                    // on exception
                catch(e) {
                    this._insp.register(`${cmdPreview} but threw an exception`, -1);
                }
            }
            else {
                this._insp.register(cmdPreview, 0);
            }

        });

    });

    this.print(`\nSpecs passed: ${this._insp.toString()}`);
    this.print(`\nTotal time: ${(+new Date - begTime)/1000.} s\n`);

    return this._insp.result;
    }
}

// exports
module.exports = SpecRunner;