var P = require('parsona');

var a    = P.string('a');
var expr = P.lazy(function() {
  return P.seq([expr, P.string('+'), a])
    .or(P.seq([expr, P.string('-'), a]))
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
  test.deepEqual(expr.parse('a+a-a'), [['a','+','a'],'-','a']);
  test.done();
};
