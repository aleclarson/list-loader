var Factory, Immutable, Loader, Q, Void, assertType, define, emptyFunction, isKind, ref;

ref = require("type-utils"), isKind = ref.isKind, assertType = ref.assertType, Void = ref.Void;

emptyFunction = require("emptyFunction");

Immutable = require("immutable");

Factory = require("factory");

Loader = require("loader");

define = require("define");

Q = require("q");

module.exports = Factory("ListLoader", {
  kind: Loader,
  optionTypes: {
    transform: [Function, Void]
  },
  initValues: function() {
    return {
      _loadedIds: Object.create(null)
    };
  },
  initReactiveValues: function() {
    return {
      loaded: Immutable.List()
    };
  },
  init: function(options) {
    if (options.transform != null) {
      return define(this, "_transform", {
        value: options.transform,
        enumerable: false
      });
    }
  },
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
    return this.initialLoad().then(function(loaded) {
      if (loaded == null) {
        throw Error("Loading aborted!");
      }
      return loaded;
    }).fail(function(error) {});
  },
  _transform: emptyFunction.thatReturnsArgument,
  _load: function() {
    return Q.fulfill([]);
  },
  _onLoad: function(items) {
    var i, item, len, loaded;
    assertType(items, Array);
    loaded = [];
    for (i = 0, len = items.length; i < len; i++) {
      item = items[i];
      if (!isKind(item, Object)) {
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
  _onUnload: function() {
    this.loaded.forEach(function(item) {
      if (isKind(item.unload, Function)) {
        item.unload();
      }
      return true;
    });
    this.loaded = Immutable.List();
    return this._loadedIds = Object.create(null);
  }
});

//# sourceMappingURL=../../map/src/ListLoader.map
