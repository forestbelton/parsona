var P = require('../lib/parsona');

var a = P.string('a'),
    b = P.string('b');

exports['.many'] = function(test) {
  test.expect(3);
  test.deepEqual(a.many().parse(''), []);
  test.deepEqual(a.many().parse('a'), ['a']);
  test.deepEqual(a.many().parse('aa'), ['a', 'a']);
  test.done();
};

exports['.or'] = function(test) {
  test.expect(3);
  test.strictEqual(a.or(b).parse('a'), 'a');
  test.strictEqual(a.or(b).parse('b'), 'b');
  test.strictEqual(a.or(b).parse('c'), undefined);
  test.done();
};

exports['.then'] = function(test) {
  test.expect(1);
  test.strictEqual(a.then(b).parse('ab'), 'b');
  test.done();
};

exports['.skip'] = function(test) {
  test.expect(1);
  test.strictEqual(a.skip(b).parse('ab'), 'a');
  test.done();
};
