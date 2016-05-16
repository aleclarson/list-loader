var Immutable, Loader, Q, Type, Void, assertType, define, emptyFunction, isType, type;

emptyFunction = require("emptyFunction");

assertType = require("assertType");

Immutable = require("immutable");

Loader = require("loader");

isType = require("isType");

define = require("define");

Type = require("Type");

Void = require("Void");

Q = require("q");

type = Type("ListLoader");

type.inherits(Loader);

type.optionTypes = {
  transform: Function.Maybe
};

type.optionDefaults = {
  transform: emptyFunction.thatReturnsArgument
};

type.defineValues({
  _transform: function(options) {
    return options.transform;
  },
  _loadedIds: function() {
    return Object.create(null);
  }
});

type.defineReactiveValues({
  loaded: function() {
    return Immutable.List();
  }
});

type.defineMethods({
  isItemLoaded: function(id) {
    return this._loadedIds[id] === true;
  },
  initialLoad: function() {
    if (this.isLoading || this.loaded.size > 0) {
      return Q.fulfill();
    }
    return this.load.apply(this, arguments);
  },
  mustLoad: function() {
    if (this.isLoading) {
      return this._loading;
    }
    if (this.loaded.size > 0) {
      return Q.fulfill(this.loaded);
    }
    return this.initialLoad.apply(this, arguments).then(function(loaded) {
      if (loaded == null) {
        throw Error("Loading aborted!");
      }
      return loaded;
    });
  }
});

type.overrideMethods({
  __onLoad: function(items) {
    var i, item, len, loaded;
    assertType(items, Array);
    loaded = [];
    for (i = 0, len = items.length; i < len; i++) {
      item = items[i];
      if (!(item instanceof Object)) {
        continue;
      }
      assertType(item.id, String);
      if (this.isItemLoaded(item.id)) {
        continue;
      }
      this._loadedIds[item.id] = true;
      loaded.push(item);
    }
    loaded = this._transform(loaded);
    assertType(loaded, [Array, Void]);
    if (loaded != null ? loaded.length : void 0) {
      this.loaded = this.loaded.concat(loaded);
      this.didLoad.emit(loaded);
    }
    return loaded;
  },
  __onUnload: function() {
    this.loaded.forEach(function(item) {
      if (isType(item.unload, Function)) {
        item.unload();
      }
      return true;
    });
    this.loaded = Immutable.List();
    return this._loadedIds = Object.create(null);
  }
});

module.exports = type.build();

//# sourceMappingURL=../../map/src/ListLoader.map
