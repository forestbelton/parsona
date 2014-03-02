function Result(type, str, val) {
  this.type = type;
  this.str  = str;
  this.val  = val;
}

var TY_PASS = 0,
    TY_FAIL = 1;

var Success = function(x, s) {
  return new Result(TY_PASS, s, x);
};

var Failure = function(s) {
  return new Result(TY_FAIL, s);
};

var eqResult = function(x, y) {
  return x.type == y.type
    && x.str == y.str
    && x.val == y.val;
};


function Parser(f) {
  this.f = f;
}

/* Functor */
Parser.prototype.map = function(f) {
  var that = this;

  return new Parser(function(str, cont) {
    that.f(str, function(res) {
      if(res.type != TY_PASS)
        return cont(res);

      res.val = f(res.val);
      return cont(res);
    });
  });
};

/* Applicative */
Parser.of = Parser.prototype.of = function(x) {
  return new Parser(succeed(x));
};

Parser.prototype.ap = function(p) {
  var that = this;

  return new Parser(function(str, cont) {
    that.f(str, function(res) {
      if(res.type != TY_PASS)
        return cont(res);

      p.f(res.str, function(res2) {
        if(res2.type != TY_PASS)
          return cont(res);

        return cont(res.val(res2.val));
      });
    });
  });
};

/* Monad */
Parser.prototype.chain = function(f) {
  var that = this;

  return new Parser(function(str, cont) {
    that.f(str, function(res) {
      if(res.type != TY_PASS)
        return cont(res);

      return f(res.val).f(res.str, cont);
    });
  });
};

Parser.prototype.parse = function(str) {
  var results = [],
    failures = [];

  this.f(str, function(result) {
    if(result.type == TY_PASS && result.str == '')
      results.push(result.val);
  });

  return results[0];
};

Parser.prototype.or = function(p) {
  return new Parser(alt(this.f, p.f));
};

Parser.prototype.then = function(p) {
  return this.chain(function() {
    return p;
  });
};

function memo(f) {
  var store = [];

  return function() {
    var args = Array.prototype.slice.call(arguments, 0);

    for(var i = 0; i < store.length; ++i) {
      /* If the argument lists have different lengths,
       * then this is obviously a different call. */
      if(store[i].args.length != args.length)
        continue;

      /* Check each argument individually. */
      var match = true;
      for(var j = 0; j < args.length; ++j)
        if(store[i].args[j] != args[j])
          match = false;
  
      if(!match)
        continue;

      return store[i].result;
    }

    /* Call the function and add the result to the store. */
    store.unshift({ args: args, result: f.apply(null, args) });
    return store[0].result;
  };
}

function memo_cps(f) {
  var store = [];

  return function(s, cont) {
    var entry;

    /* Look for an entry that already has this string. */
    for(var i = 0; i < store.length; ++i) {
      if(store[i].str == s) {
        entry = store[i].entry;
        break;
      }
    }

    /* This is the first time the memoized procedure
     * has been called with s. */
    if(typeof entry == 'undefined') {
      /* By default we only have one continuation
       * that is subscribing to results. */
      var item = {
        str: s,
        entry: {
          results: [],
          conts:   [cont]
        }
      };
      var entry = item.entry;

      /* Add the entry to the store. */
      store.push(item);

      f(s, function(result) {
        /* Make sure this result hasn't already been
         * computed. If it hasn't, broadcast it to all
         * 'listening', continuations. */
        var found = false;
        for(var i = 0; i < entry.results.length; ++i) {
          if(eqResult(entry.results[i], result))
            found = true;
        }

        if(!found) {
          entry.results.push(result);

          for(var i = 0; i < entry.conts.length; ++i) {
            entry.conts[i](result);
          }
        }
      });
    }

    /* The memoized procedure has been called with this
     * string before. Add it to the list of listening
     * continuations and notify it of all the results we
     * have thus far. */
    else {
      entry.conts.push(cont);

      for(var i = 0; i < entry.results.length; ++i) {
        cont(entry.results[i]);
      }
    }
  };
}

var succeed = memo(function(x) {
  return memo_cps(function(str, cont) {
    return cont(Success(x, str));
  });
});

var string = memo(function(s) {
  return new Parser(memo_cps(function(str, cont) {
    return cont(
      str.indexOf(s) == 0
      ? Success(s, str.substring(s.length))
      : Failure(str)
    );
  }));
});

var seq = function(xs) {
  if(xs.length == 0)
    return Parser.of([]);

  return xs[0].chain(function(x) {
    return seq(xs.slice(1)).map(function(ys) {
      return [x].concat(ys);
    });
  });
};

var alt = memo(function(a, b) {
  return memo_cps(function(str, cont) {
    a(str, cont);
    return b(str, cont);
  });
});

var lazy = function(f) {
  var g = memo(f);
  return new Parser(function(str, cont) {
    return g().f(str, cont);
  });
};

if(typeof module != 'undefined') {
  module.exports = {
    lazy:    lazy,
    seq:     seq,
    string:  string,
    succeed: succeed
  };
}

