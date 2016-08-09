var Loader, Promise, ReactiveList, Type, assertType, type;

ReactiveList = require("ReactiveList");

assertType = require("assertType");

Promise = require("Promise");

Loader = require("loader");

Type = require("Type");

type = Type("ListLoader");

type.inherits(Loader);

type.defineOptions({
  allowDupes: Boolean.withDefault(false),
  cacheResults: Boolean.withDefault(false)
});

type.defineValues({
  _loaded: function(options) {
    if (options.allowDupes) {
      return;
    }
    return Object.create(null);
  },
  _cache: function(options) {
    if (!options.cacheResults) {
      return;
    }
    return ReactiveList();
  }
});

type.defineGetters({
  loaded: function() {
    if (this._cache) {
      return this._cache.array;
    }
    throw Error("Cannot access 'loaded' when 'options.cacheResults' is false!");
  },
  isLoaded: function() {
    if (this._cache) {
      return this._cache.length > 0;
    }
    throw Error("Cannot access 'isLoaded' when 'options.cacheResults' is false!");
  },
  numLoaded: function() {
    if (this._cache) {
      return this._cache.length;
    }
    throw Error("Cannot access 'numLoaded' when 'options.cacheResults' is false!");
  }
});

type.defineMethods({
  hasItem: function(id) {
    if (this._loaded) {
      return this._loaded[id] === true;
    }
    throw Error("Cannot call 'hasItem' when 'options.allowDupes' is true!");
  },
  firstLoad: function() {
    if (this._cache) {
      if (this._cache.length) {
        return Promise(this._cache.array);
      }
      if (this._loading) {
        return this._loading;
      }
      return this.load.apply(this, arguments);
    }
    throw Error("Cannot call 'firstLoad' when 'options.cacheResults' is false!");
  },
  forEach: function(iterator) {
    if (this._cache) {
      return this._cache.forEach(iterator);
    }
    throw Error("Cannot call 'forEach' when 'options.cacheResults' is false!");
  }
});

type.overrideMethods({
  __onLoad: function(items) {
    var loaded;
    assertType(items, Array, "items");
    loaded = this._loaded;
    loaded && (items = items.filter(function(item, index) {
      assertType(item.id, String, "items[" + index + "].id");
      if (loaded[item.id]) {
        return false;
      }
      loaded[item.id] = true;
      return true;
    }));
    items.length && this._cache.append(items);
    return items;
  },
  __onUnload: function() {
    this._loaded && (this._loaded = Object.create(null));
    this._cache && this._cache.forEach(function(item) {
      return item.unload && item.unload();
    });
  }
});

module.exports = type.build();

//# sourceMappingURL=map/ListLoader.map
