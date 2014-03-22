var P = require('../lib/parsona');

var a    = P.string('a');
var expr = P.lazy(function() {
  return P.seq([a, P.string('+'), expr])
    .or(P.seq([a, P.string('-'), expr]))
    .or(a);
});

exports['single case'] = function(test) {
  test.expect(1);
  test.strictEqual(expr.parse('a'), 'a');
  test.done();
};

exports['two operands with plus'] = function(test) {
  test.expect(1);
  test.deepEqual(expr.parse('a+a'), ['a','+','a']);
  test.done();
};

exports['two operands with minus'] = function(test) {
  test.expect(1);
  test.deepEqual(expr.parse('a-a'), ['a','-','a']);
  test.done();
};

exports['three operands'] = function(test) {
  test.expect(1);
  test.deepEqual(expr.parse('a+a-a'), ['a','+',['a','-','a']]);
  test.done();
};
