const assert = require('assert');
const formatters = require('../formatters');

describe('logger:lib:formatters', () => {
  const date = new Date('2016-04-22T11:29:23.904Z');
  const level = 'error';
  const message = 'Winter is coming';

  describe('logger:lib:formatters:console', () => {
    it('should format data: simplest case', () => {
      assert.equal(formatters.console({
        level,
        message,
        meta: {},
        date,
      }), '11:29:23.904 ERROR - Winter is coming');
    });

    it('should format data: colors', () => {
      assert.equal(formatters.console({
        colorize: true,
        level,
        message,
        meta: {},
        date,
      }), '\u001b[31m11:29:23.904 ERROR - Winter is coming\u001b[39m');
    });

    it('should format data: meta with name', () => {
      const meta = { name: 'ComponentName' };
      assert.equal(
        formatters.console({ level, message, meta, date }),
        `11:29:23.904 ERROR - ComponentName: Winter is coming
${JSON.stringify(meta, null, 2)}`
      );
    });

    it('should format data: trace formatter', () => {
      const meta = { trace: [
        { file: 'foo/bar.js', line: 30, column: 3, function: 'main' },
        { native: true, function: 'Module._compile' },
      ], foo: 'bar' };

      const expectedJson = JSON.stringify({ trace: [
        'main (foo/bar.js:30:3)',
        'Module._compile (native)',
      ], foo: 'bar' }, null, 2);

      assert.equal(
        formatters.console({ level, message, meta, date }),
        `11:29:23.904 ERROR - Winter is coming
${expectedJson}`
      );
    });

    it('should format data: stack formatter shortening if beyond frames depth', () => {
      const stack = 'Error: oh no!' +
        ' ↳ at speedy (/home/file.js:6:11)' +
        ' ↳ at makeFaster (/home/file.js:5:3)' +
        ' ↳ at Object.<anonymous> (/home/file.js:10:1)' +
        ' ↳ at Module._compile (module.js:456:26)' +
        ' ↳ at Object.Module._extensions..js (module.js:474:10)' +
        ' ↳ at Module.load (module.js:356:32)' +
        ' ↳ at Function.Module._load (module.js:312:12)' +
        ' ↳ at Function.Module.runMain (module.js:497:10)' +
        ' ↳ at startup (node.js:119:16)' +
        ' ↳ at node.js:906:3';

      const meta = { stack, name: 'ComponentName' };
      const expectedJson = JSON.stringify({ name: 'ComponentName' }, null, 2);

      // Note: you can use `new Buffer(expected).toString('hex')` output debugging
      assert.equal(
        formatters.console({ level, message, meta, date }),
        `11:29:23.904 ERROR - ComponentName: Winter is coming
${expectedJson}
` +
        '\u001b[31mError:\u001b[0m oh no!' +
        ' ↳ at speedy (/home/file.js:6:11)' +
        ' ↳ at makeFaster (/home/file.js:5:3)' +
        ' ↳ at Object.<anonymous> (/home/file.js:10:1)' +
        ' ↳ at Module._compile (module.js:456:26) ' +
        '\x1b[1;34mAdditional 6 internal frames hidden\u001b[0m\n'
      );
    });
  });
});
