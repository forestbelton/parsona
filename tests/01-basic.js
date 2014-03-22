var P = require('../lib/parsona');

var a = P.string('a'),
    b = P.string('b');

exports['regex'] = function(test) {
  test.expect(1);
  test.strictEqual(P.regex(/[0-9]+/).parse('123'), '123');
  test.done();
};

exports['succeed'] = function(test) {
  test.expect(1);
  test.strictEqual(P.succeed(42).parse(''), 42);
  test.done();
};

exports['seq'] = function(test) {
  test.expect(1);
  test.deepEqual(P.seq([a, b]).parse('ab'), ['a', 'b']);
  test.done();
};
