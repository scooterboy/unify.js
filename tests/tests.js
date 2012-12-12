(function() {
  var Test, UnifyTest, prop, str, test, unifylib,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  str = function(obj) {
    if (obj === null) {
      return "null";
    } else if (typeof obj === "undefined") {
      return "undefined";
    } else {
      return obj.toString();
    }
  };

  Test = (function() {

    function Test(name, func) {
      this.name = name;
      this.func = func;
      this.num = 0;
    }

    Test.prototype.expect = function(num) {
      return this.num = num;
    };

    Test.prototype.equal = function(arg1, arg2, message) {
      if (message == null) {
        message = "''";
      }
      this.num--;
      if (arg1 !== arg2) {
        throw "'#NotEqual: {str(arg1)}' does not equal '" + (str(arg2)) + "\n   " + message + "'";
      }
    };

    Test.prototype.deepEqual = function(arg1, arg2, message) {
      if (message == null) {
        message = "";
      }
      this.num--;
      if (!require('deep-equal')(arg1, arg2)) {
        throw "'#NotEqual: {str(arg1)}' does not equal '" + (str(arg2)) + "\n   " + message;
      }
    };

    Test.prototype.ok = function(bool, message) {
      if (message == null) {
        message = "";
      }
      this.num--;
      if (!bool) {
        throw "NotOk: false was passed to ok\n   " + message;
      }
    };

    Test.prototype.done = function(message) {
      if (message == null) {
        message = "";
      }
      if (this.num !== 0) {
        throw "NotDone: " + (str(this.num)) + " more checks were expected before done was called\n   " + message;
      }
    };

    Test.prototype.run = function() {
      this.func.call(this);
      return this.done();
    };

    return Test;

  })();

  test = function(name, func) {
    var t;
    t = new Test(name, func);
    return exports[name] = function() {
      return t.run();
    };
  };

  exports.RunAll = function() {
    var name;
    for (name in exports) {
      if (name !== "RunAll") {
        try {
          exports[name]();
        } catch (ex) {
          console.log("Error in Test '" + name + "'");
          console.log("Message: " + ex);
          console.log("Stack:\n" + ex.stack);
          console.log('');
        }
      }
    }
  };

  unifylib = require("../lib/unify");

  for (prop in unifylib) {
    global[prop] = unifylib[prop];
  }

  UnifyTest = (function(_super) {

    __extends(UnifyTest, _super);

    function UnifyTest() {
      return UnifyTest.__super__.constructor.apply(this, arguments);
    }

    UnifyTest.prototype.parsetest = function(obj) {
      this.num++;
      return this.deepEqual(parse(obj).unparse(), obj, "parse");
    };

    UnifyTest.prototype.unifytest = function(obj1, obj2) {
      this.num++;
      return this.ok(unify(obj1, obj2), "unify");
    };

    UnifyTest.prototype.unifyfailtest = function(obj1, obj2) {
      this.num++;
      return this.ok(!unify(obj1, obj2), "unify fail");
    };

    UnifyTest.prototype.gettest = function(tin, varValueDict) {
      var v, _results;
      _results = [];
      for (v in varValueDict) {
        this.num++;
        if (varValueDict[v] instanceof variable) {
          _results.push(this.ok(tin.get(v) instanceof variable, "get(" + v + ") = variable()"));
        } else {
          _results.push(this.deepEqual(tin.get(v), varValueDict[v], "get(" + v + ") == " + (toJson(varValueDict[v]))));
        }
      }
      return _results;
    };

    UnifyTest.prototype.fulltest = function(obj1, obj2, varValueDict1, varValueDict2) {
      this.parsetest(obj1);
      this.parsetest(obj2);
      obj1 = parse(obj1);
      obj2 = parse(obj2);
      this.unifytest(obj1, obj2);
      this.gettest(obj1, varValueDict1);
      return this.gettest(obj2, varValueDict2);
    };

    return UnifyTest;

  })(Test);

  test = function(name, func) {
    var t;
    t = new UnifyTest(name, func);
    return exports[name] = function() {
      return t.run();
    };
  };

  test("empty obj {} -> {}", function() {
    return this.fulltest({}, {}, {}, {});
  });

  test("null test [null] -> [null]", function() {
    return this.fulltest([null], [null], {}, {});
  });

  test("variable equal [X] -> [1]", function() {
    return this.fulltest([variable("a")], [1], {
      a: 1
    }, {});
  });

  test("variable equal [X,X] -> [1,1]", function() {
    return this.fulltest([variable("a"), variable("a")], [1, 1], {
      a: 1
    }, {});
  });

  test("variable equal [[1,2,3]] -> [y]", function() {
    return this.fulltest([[1, 2, 3]], [variable("y")], {}, {
      y: [1, 2, 3]
    });
  });

  test("variable equal [[1,2,x],x] -> [y,3]", function() {
    return this.fulltest([[1, 2, variable("x")], variable("x")], [variable("y"), 3], {
      x: 3
    }, {
      y: [1, 2, 3]
    });
  });

  test("unbound variable [y]->[x]", function() {
    return this.fulltest([variable("y")], [variable("x")], {
      y: variable("x")
    }, {
      x: variable("x")
    });
  });

  test("variable equal [1,X,X] -> [Z,Z,1]", function() {
    return this.fulltest([1, variable("X"), variable("X")], [variable("Z"), variable("Z"), 1], {
      X: 1
    }, {
      Z: 1
    });
  });

  test("variable equal [X,X] -> [1,2]", function() {
    return this.unifyfailtest([variable("a"), variable("a")], [1, 2]);
  });

  test("variable unequal [1,3,2] -> [Y,Y,2]", function() {
    return this.unifyfailtest([1, 3, 2], [variable("y"), variable("y"), 2]);
  });

  test("variable unequal [1,X,X] -> [Z,Z,3]", function() {
    return this.unifyfailtest([1, variable("X"), variable("X")], [variable("Z"), variable("Z"), 3]);
  });

  test("simple black box unify test", function() {
    this.expect(1);
    return this.ok(unify({
      a: [1, 2, 3]
    }, {
      a: [1, variable("b"), 3]
    }));
  });

  test("variable equal [X,2,X] -> [1,2,1]", function() {
    var tins;
    this.expect(2);
    tins = unify([variable("x"), 2, variable("x")], [1, 2, 1]);
    this.ok(tins);
    return this.deepEqual(tins[0].get_all(), {
      "x": 1
    });
  });

  test("simple variable extraction test", function() {
    var tins;
    this.expect(1);
    tins = unify({
      a: [1, 2, 3]
    }, {
      a: [1, variable("b"), 3]
    });
    return this.ok(tins[1].get("b") === 2);
  });

  test("extract all variables test", function() {
    var tins;
    this.expect(1);
    tins = unify({
      a: [1, 2, 3]
    }, {
      a: [1, variable("b"), 3]
    });
    return this.deepEqual(tins[1].get_all(), {
      "b": 2
    });
  });

  test("create hidden variable", function() {
    this.expect(1);
    return this.ok((variable("_")).isHiddenVar());
  });

  test("simple hidden variable [_,X] -> [1,2]", function() {
    return this.fulltest([variable("_"), variable("x")], [1, 2], {
      "x": 2
    }, {});
  });

  test("multiple hidden variables [_,_,X] -> [1,2,3]", function() {
    return this.fulltest([variable("_"), variable("_"), variable("x")], [1, 2, 3], {
      "x": 3
    }, {});
  });

  test("[[1,_,3],[1,2,3]] -> [X,X]", function() {
    return this.fulltest([[1, variable("_"), 3], [1, 2, 3]], [variable("x"), variable("x")], {}, {
      "x": [1, 2, 3]
    });
  });

  test("rollback successful unification", function() {
    var changes, cobj1, cobj2, obj1, obj2;
    this.expect(3);
    obj1 = [1, 2, 3];
    obj2 = [variable("A"), variable("B"), 3];
    this.parsetest(obj1);
    this.parsetest(obj2);
    obj1 = parse(obj1);
    obj2 = parse(obj2);
    cobj1 = eval(obj1.toString());
    cobj2 = eval(obj2.toString());
    changes = [];
    this.ok(unify(obj1, obj2, changes), "unify");
    rollback(changes);
    this.ok(obj1.toString() === cobj1.toString());
    return this.ok(obj2.toString() === cobj2.toString());
  });

}).call(this);