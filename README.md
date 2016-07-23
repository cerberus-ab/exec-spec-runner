# exec-spec-runner
Simple spec-runner for executable scripts.

### Installation
Install exec-spec-runner using npm:
```
$ npm install exec-spec-runner --save-dev
```
For example you may use this npm task in the packet directory:
```
$ cd node_modules/exec-spec-runner
$ npm test
```

### Usage
This is very simple framework for testing your executable scripts. It executes scipts synchronously one by one and compares each result with the expected. You should describe your scripts in manifest file.
```
const SpecRunner = require('exec-spec-runner');
let sr = new SpecRunner(require('./mans'), {
        rootDir: `./`,
        parse: (output) => output,
        print: process.stdout.write.bind(process.stdout)
    }
});
sr.run();
```
### Options
* `rootDir` {string} Root directory for your scripts, Default: **./**
* `parse` {function} Used parse function for scripts output, Default: **returns raw stdout**
* `print` {function} Used print function, Default: **process.stdout.write**

### Manifest format
[Manifest example](examples/mans.json)
```
[{
  "name": "return.js",
  "path": "return.js",
  "usage": "node",
  "tests": [
    { "argv": "--answer=100", "result": 100 },
    { "argv": "--answer=-20", "result": -20 }
  ]
}]
```
* `name` {string} Script name
* `path` {string} Relative to **rootDir** script path
* `usage` {string} Used interpreter (**node**, **sh**, **python** etc)
* `tests` {Array} The set of acceptance tests
    * `argv` {string} Scripts arguments
    * `result` {number} The expected result *(after use parse method)*

### Exemplary run
```
> exec-spec-runner@0.2.0 test /Users/cerberus/Pro/exec-spec-runner
> node ./examples/test.js

Testing executable scripts:
  Testing: testr.js
   - script exists
   - 1. "$ node testr.js --answer=hello --ack=hello" should be 100 [95 ms]
   - 2. "$ node testr.js --answer=hello --ack=" hello "" should be 100 [91 ms]
   * 3. "$ node testr.js --answer=hello --ack=hellO" should be 20 but returned 0 [92 ms]
   - 4. "$ node testr.js --answer=hello --ack=hellO --i" should be 100 [94 ms]
   ! 5. "$ node testr.js --answer=hello" should be 0 but threw an exception
  Testing: return.js
   * script exists
   * 1. "$ node return.js --answer=100" should be 100
   * 2. "$ node return.js --answer=-20" should be -20
  Testing: time.js
   - script exists
   - 1. "$ node time.js" should be 100 [92 ms]

Specs passed: 6/11
Total time: 0.545 s
```