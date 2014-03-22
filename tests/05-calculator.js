var P = require('../lib/parsona');

var num = P.regex(/[0-9]+/).map(function(s) {
  return parseInt(s, 10);
});

var expr = P.lazy(function() {
  return P.seq([expr, P.string('+'), factor]).map(function(xs) {
    return xs[0] + xs[2];
  })
    .or(P.seq([expr, P.string('-'), factor]).map(function(xs) {
    return xs[0] - xs[2];
  }))
    .or(factor);
});

var factor = P.lazy(function() {
  return P.seq([factor, P.string('*'), term]).map(function(xs) {
    return xs[0] * xs[2];
  })
    .or(P.seq([factor, P.string('/'), term]).map(function(xs) {
    return xs[0] / xs[2];
  }))
    .or(term);
});

var term = P.string('(').then(expr).skip(P.string(')'))
  .or(num);

exports['2 * 2 = 4'] = function(test) {
  test.expect(1);
  test.strictEqual(expr.parse('2*2'), 4);
  test.done();
};

exports['1 + 2 * 3 = 7'] = function(test) {
  test.expect(1);
  test.strictEqual(expr.parse('1+2*3'), 7);
  test.done();
};

exports['(4 / 2) * (3 - 1) = 4'] = function(test) {
  test.expect(1);
  test.strictEqual(expr.parse('(4/2)*(3-1)'), 4);
  test.done();
};
